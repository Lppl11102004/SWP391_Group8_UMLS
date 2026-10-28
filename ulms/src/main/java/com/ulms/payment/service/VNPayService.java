package com.ulms.payment.service;

import com.ulms.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {
    @Value("${vnpay.tmn-code}")
    private String vnpTmnCode;
    @Value("${vnpay.hash-secret}")
    private String vnpHashSecret;
    @Value("${vnpay.pay-url}")
    private String vnpPayUrl;
    @Value("${vnpay.return-url}")
    private String vnpReturnUrl;
    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;

    // HÀM 1: TẠO URL THANH TOÁN (Tái sử dụng cho mọi loại tiền)
    public String createPaymentUrl(String txnRef, BigDecimal amount, String orderInfo, HttpServletRequest request) {
        long amountInVND = amount.multiply(BigDecimal.valueOf(100)).longValue();
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amountInVND));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        vnpParams.put("vnp_ExpireDate", formatter.format(cld.getTime()));
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            if (hashData.length() > 0) {
                hashData.append('&');
                query.append('&');
            }
            hashData.append(entry.getKey()).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnpHashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);
        return vnpPayUrl + "?" + query;
    }
    // HÀM 2: XÁC THỰC CHỮ KÝ TỪ VNPAY GỬI VỀ
    public boolean verifySignature(Map<String, String> queryParams) {
        Map<String, String> fields = new HashMap<>(queryParams);
        String vnpSecureHash = fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        StringBuilder hashData = new StringBuilder();
        Map<String, String> sortedFields = new TreeMap<>(fields);
        for (Map.Entry<String, String> entry : sortedFields.entrySet()) {
            if (hashData.length() > 0) hashData.append('&');
            hashData.append(entry.getKey()).append('=').append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
        }
        String signValue = VNPayUtil.hmacSHA512(vnpHashSecret, hashData.toString());
        return signValue != null && signValue.equalsIgnoreCase(vnpSecureHash);
    }

    // HÀM 3: TRUY VẤN TRẠNG THÁI GIAO DỊCH TỪ VNPAY (QueryDR)
    public Map<String, Object> queryTransaction(String txnRef, java.time.LocalDateTime transactionDate, HttpServletRequest request) {
        try {
            String vnpRequestId = String.valueOf(System.currentTimeMillis());
            String vnpVersion = "2.1.0";
            String vnpCommand = "querydr";
            String vnpOrderInfo = "Kiem tra trang thai giao dich " + txnRef;

            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Etc/GMT+7"));

            String vnpTransDate;
            if (transactionDate != null) {
                java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
                vnpTransDate = transactionDate.format(dtf);
            } else {
                vnpTransDate = formatter.format(new Date());
            }
            String vnpCreateDate = formatter.format(new Date());
            String vnpIpAddr = VNPayUtil.getIpAddress(request);
            if (vnpIpAddr == null || vnpIpAddr.isEmpty() || "0:0:0:0:0:0:0:1".equals(vnpIpAddr)) {
                vnpIpAddr = "127.0.0.1";
            }

            // Chuỗi băm theo format chuẩn VNPay 2.1.0 QueryDR:
            // vnp_RequestId|vnp_Version|vnp_Command|vnp_TmnCode|vnp_TxnRef|vnp_TransactionDate|vnp_CreateDate|vnp_IpAddr|vnp_OrderInfo
            String hashData = String.join("|", vnpRequestId, vnpVersion, vnpCommand, vnpTmnCode, txnRef, vnpTransDate, vnpCreateDate, vnpIpAddr, vnpOrderInfo);
            String vnpSecureHash = VNPayUtil.hmacSHA512(vnpHashSecret, hashData);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("vnp_RequestId", vnpRequestId);
            requestBody.put("vnp_Version", vnpVersion);
            requestBody.put("vnp_Command", vnpCommand);
            requestBody.put("vnp_TmnCode", vnpTmnCode);
            requestBody.put("vnp_TxnRef", txnRef);
            requestBody.put("vnp_OrderInfo", vnpOrderInfo);
            requestBody.put("vnp_TransactionDate", vnpTransDate);
            requestBody.put("vnp_CreateDate", vnpCreateDate);
            requestBody.put("vnp_IpAddr", vnpIpAddr);
            requestBody.put("vnp_SecureHash", vnpSecureHash);

            com.google.gson.Gson gson = new com.google.gson.Gson();
            String jsonPayload = gson.toJson(requestBody);

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(vnpApiUrl))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> httpResponse = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            return gson.fromJson(httpResponse.body(), Map.class);
        } catch (Exception e) {
            throw new com.ulms.exception.ApiException("Lỗi khi kết nối tra cứu VNPay: " + e.getMessage());
        }
    }
}
