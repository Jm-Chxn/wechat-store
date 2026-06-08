package com.tuangou.activity.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record TrackEventRequest(
    @NotBlank String type,
    String anonId,
    Map<String, Object> meta
) {}
