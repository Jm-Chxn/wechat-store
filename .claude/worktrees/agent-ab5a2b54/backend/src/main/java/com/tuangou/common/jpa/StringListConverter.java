package com.tuangou.common.jpa;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.List;

/**
 * Converts a {@code List<String>} field to a comma-separated VARCHAR for storage.
 * The Postgres schema also uses TEXT for {@code dietary_tags} so the same converter
 * round-trips identically against H2 and Supabase Postgres.
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

  private static final String SEPARATOR = ",";

  @Override
  public String convertToDatabaseColumn(List<String> attribute) {
    if (attribute == null || attribute.isEmpty()) return "";
    return String.join(SEPARATOR, attribute);
  }

  @Override
  public List<String> convertToEntityAttribute(String dbData) {
    if (dbData == null) return new ArrayList<>();
    String trimmed = dbData.trim();
    if (trimmed.isEmpty()) return new ArrayList<>();
    String[] parts = trimmed.split(SEPARATOR);
    List<String> out = new ArrayList<>(parts.length);
    for (String p : parts) {
      String s = p.trim();
      if (!s.isEmpty()) out.add(s);
    }
    return out;
  }
}
