package com.tuangou.activity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tuangou.activity.dto.ActivityDto;
import com.tuangou.activity.dto.TrackEventRequest;
import com.tuangou.activity.entity.ActivityEntity;
import com.tuangou.activity.repo.ActivityRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {
  private final ActivityRepository repo;
  private final ObjectMapper objectMapper;

  public ActivityService(ActivityRepository repo, ObjectMapper objectMapper) {
    this.repo = repo;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public ActivityDto track(UUID userId, TrackEventRequest req) {
    return saveInternal(req.type(), userId, req.anonId(), req.meta());
  }

  @Transactional
  public ActivityDto track(String type, UUID userId, Map<String, Object> meta) {
    return saveInternal(type, userId, null, meta);
  }

  private ActivityDto saveInternal(String type, UUID userId, String anonId, Map<String, Object> meta) {
    String json;
    try {
      json = meta == null ? "{}" : objectMapper.writeValueAsString(meta);
    } catch (JsonProcessingException ex) {
      json = "{}";
    }
    ActivityEntity saved = repo.save(ActivityEntity.builder()
        .type(type)
        .userId(userId)
        .anonId(anonId)
        .meta(json)
        .build());
    return toDto(saved);
  }

  @Transactional(readOnly = true)
  public List<ActivityDto> listAll() {
    return repo.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
  }

  @Transactional(readOnly = true)
  public List<ActivityDto> listForUser(UUID userId) {
    return repo.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
  }

  private ActivityDto toDto(ActivityEntity e) {
    return new ActivityDto(e.getId(), e.getType(), e.getUserId(), e.getAnonId(), e.getMeta(), e.getCreatedAt());
  }
}
