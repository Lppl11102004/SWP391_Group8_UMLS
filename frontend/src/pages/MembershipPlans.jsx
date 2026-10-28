import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Coins, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { membershipApi } from '../api/membership';
import { useAuth } from '../context/AuthContext';
import { formatVND, formatSystemConfigValue } from '../utils/format';

export const MembershipPlans = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [upgradePlans, setUpgradePlans] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Purchase state
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(2); // 2: VNPay, 1: Tiền mặt
  const [planType, setPlanType] = useState(true); // true: Mua mới / Gia hạn, false: Nâng cấp
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [openRuleIndex, setOpenRuleIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          membershipApi.getPlans(),
          membershipApi.getRules(),
        ];

        if (isAuthenticated) {
          promises.push(membershipApi.getMyMembership());
          promises.push(membershipApi.getUpgradePlans());
        }

        const [plansRes, rulesRes, myMemRes, upgradeRes] = await Promise.allSettled(promises);

        if (plansRes.status === 'fulfilled') {
          const list = plansRes.value.data?.data || plansRes.value.data || [];
          setPlans(Array.isArray(list) ? list : []);
          if (list.length > 0) {
            setSelectedPlanId(list[0].planId);
          }
        }

        if (rulesRes.status === 'fulfilled') {
          const rList = rulesRes.value.data?.data || rulesRes.value.data || [];
          setRules(Array.isArray(rList) ? rList : []);
        }

        if (myMemRes && myMemRes.status === 'fulfilled') {
          const mData = myMemRes.value.data?.data;
          setMyMembership(mData || null);
        }

        if (upgradeRes && upgradeRes.status === 'fulfilled') {
          const uList = upgradeRes.value.data?.data || [];
          setUpgradePlans(Array.isArray(uList) ? uList : []);
        }
      } catch (err) {
        console.error('Error fetching membership plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await membershipApi.purchasePlan(planId, paymentMethod, planType);
      const data = res.data;

      const redirectUrl = data.data;
      if (redirectUrl && redirectUrl.startsWith('http')) {
        sessionStorage.setItem('vnpay_return_url', '/plans');
        window.location.href = redirectUrl;
        return;
      } else {
        setMessage({
          type: 'error',
          text: 'Không nhận được đường dẫn thanh toán từ cổng VNPay.',
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể xử lý yêu cầu đăng ký gói hội viên.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Đặc Quyền Hội Viên Thư Viện ULMS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Chọn Gói Hội Viên Phù Hợp Với Bạn
        </h1>
        <p className="text-sm text-slate-500">
          Mở khoá quyền đọc E-Book trực tuyến không giới hạn và hưởng ưu đãi miễn giảm tiền đặt cọc mượn sách vật lý tại thư viện.
        </p>

        {/* Plan Type Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mt-4">
          <button
            onClick={() => setPlanType(true)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              planType
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mua Mới / Gia Hạn
          </button>
          <button
            onClick={() => setPlanType(false)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              !planType
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nâng Cấp Gói (Cấn Trừ Ngày Còn Lại)
          </button>
        </div>
      </div>

      {/* Current Active Membership Card */}
      {myMembership && myMembership.status === 1 && myMembership.membershipPlansResponse && (
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Gói Hội Viên Đang Kích Hoạt
            </span>
            <h3 className="text-xl font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
              Gói {myMembership.membershipPlansResponse.name}
            </h3>
            <p className="text-xs text-emerald-100">
              Hạn sử dụng: <b>{new Date(myMembership.endAt).toLocaleDateString('vi-VN')}</b> • Còn lại:{' '}
              <b className="text-white bg-emerald-800/50 px-2 py-0.5 rounded-full">
                {myMembership.totalDayRemain || 0} ngày
              </b>
            </p>
          </div>
          <div className="text-left sm:text-right sm:self-center">
            <span className="text-xs text-emerald-100 block">Quyền lợi cọc sách:</span>
            <span className="text-sm font-bold text-white">
              {myMembership.membershipPlansResponse.depositDiscountPct > 0
                ? `Giảm ${myMembership.membershipPlansResponse.depositDiscountPct}% tiền cọc`
                : 'Đọc E-Book không giới hạn'}
            </span>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`max-w-2xl mx-auto p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Payment Method Box - Only Online Payment (VNPay) */}
      <div className="max-w-md mx-auto bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Thanh toán trực tuyến VNPay</h4>
            <p className="text-[11px] text-slate-500">Kích hoạt gói hội viên tự động ngay lập tức</p>
          </div>
        </div>
        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Cổng chính thức
        </span>
      </div>

      {/* Plans Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-8 border border-slate-200 h-96"></div>
          ))}
        </div>
      ) : (planType ? plans : upgradePlans).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
          <p className="text-sm font-semibold text-slate-700">
            {!planType
              ? 'Bạn đang sử dụng gói cao nhất hoặc chưa có gói nào đủ điều kiện nâng cấp.'
              : 'Các gói hội viên đang được hệ thống cập nhật.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(planType ? plans : upgradePlans).map((plan, index) => {
            const isFeatured = index === 1; // Middle card highlights
            const priceFormatted = formatVND(plan.price);

            return (
              <div
                key={plan.planId}
                className={`relative bg-white rounded-3xl p-8 border transition-all flex flex-col justify-between ${
                  isFeatured
                    ? 'border-indigo-500 shadow-2xl ring-2 ring-indigo-500/20'
                    : 'border-slate-200 shadow-md hover:shadow-xl'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-sky-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                    Phổ biến nhất
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Thời hạn: <b className="text-slate-800">{plan.durationDays} ngày</b>
                    </p>
                  </div>

                  <div className="pb-6 border-b border-slate-100">
                    <span className="text-3xl sm:text-4xl font-extrabold text-indigo-700">
                      {priceFormatted}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ chu kỳ</span>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700">
                    {plan.depositDiscountPct > 0 && (
                      <li className="flex items-center space-x-2.5">
                        <div className="p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          Giảm tiền đặt cọc: <b>{plan.depositDiscountPct}%</b>
                        </span>
                      </li>
                    )}

                    {plan.freeDepositPriceLimit && Number(plan.freeDepositPriceLimit) > 0 && (
                      <li className="flex items-center space-x-2.5">
                        <div className="p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          Miễn cọc sách dưới: <b>{formatVND(plan.freeDepositPriceLimit)}</b>
                        </span>
                      </li>
                    )}

                    {plan.maxDepositAmount && Number(plan.maxDepositAmount) > 0 && (
                      <li className="flex items-center space-x-2.5">
                        <div className="p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          Tiền cọc tối đa chỉ: <b>{formatVND(plan.maxDepositAmount)}</b>
                        </span>
                      </li>
                    )}

                    <li className="flex items-center space-x-2.5">
                      <div className="p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Đọc không giới hạn toàn bộ kho E-Book PDF</span>
                    </li>

                    <li className="flex items-center space-x-2.5">
                      <div className="p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>Ưu tiên xử lý đơn mượn tại quầy thủ thư</span>
                    </li>
                  </ul>

                  {plan.description && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {plan.description}
                    </p>
                  )}
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleSubscribe(plan.planId)}
                    disabled={submitting}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 ${
                      isFeatured
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-lg'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {submitting && selectedPlanId === plan.planId ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{planType ? 'Đăng Ký Gói Này' : 'Nâng Cấp Ngay'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Library Rules Accordion */}
      {rules.length > 0 && (
        <div id="rules" className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Quy Định Thư Viện & Chính Sách Tiền Cọc
              </h2>
              <p className="text-xs text-slate-500">
                Tìm hiểu các quy chuẩn mượn trả và bảo quản tài liệu
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {rules.map((rule, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenRuleIndex(openRuleIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  <span>{rule.description || `Quy định #${idx + 1}`}</span>
                  {openRuleIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {openRuleIndex === idx && (
                  <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Mức quy chuẩn áp dụng:</span>
                      <span className="font-extrabold text-indigo-700 text-sm">
                        {formatSystemConfigValue(rule.settingKey || rule.description, rule.settingValue)}
                      </span>
                    </div>
                    {rule.settingKey && (
                      <span className="text-[10px] font-mono bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500">
                        {rule.settingKey}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
