package com.ulms.auth.repository;

import com.ulms.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Byte> {
    Role findByRoleName(String roleName);
}
