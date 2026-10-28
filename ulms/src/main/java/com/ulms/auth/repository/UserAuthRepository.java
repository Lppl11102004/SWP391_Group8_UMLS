package com.ulms.auth.repository;

import com.ulms.auth.entity.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findByProviderAndProviderId(String provider, String providerId);
    Optional<UserAuth> findByUser_UserIdAndProvider(Long userId, String provider);
}
