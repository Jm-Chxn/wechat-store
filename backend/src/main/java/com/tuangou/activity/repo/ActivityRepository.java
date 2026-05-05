package com.tuangou.activity.repo;

import com.tuangou.activity.entity.ActivityEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<ActivityEntity, UUID> {
  List<ActivityEntity> findAllByOrderByCreatedAtDesc();

  List<ActivityEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
