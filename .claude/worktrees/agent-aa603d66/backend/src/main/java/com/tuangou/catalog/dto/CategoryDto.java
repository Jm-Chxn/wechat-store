package com.tuangou.catalog.dto;

public record CategoryDto(
    String slug,
    String nameEn,
    String nameZh,
    String iconName,
    String blurbEn,
    String blurbZh
) {}
