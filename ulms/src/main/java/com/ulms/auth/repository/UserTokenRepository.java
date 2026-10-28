package com.ulms.auth.repository;

import com.ulms.auth.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTokenRepository  extends JpaRepository<UserToken, Long>{
    Optional<UserToken> findByUser_UserIdAndTokenType(Long userId, Boolean tokenType);
}
