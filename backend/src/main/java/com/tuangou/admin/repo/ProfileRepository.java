package com.tuangou.admin.repo;

import com.tuangou.admin.entity.ProfileEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {}
