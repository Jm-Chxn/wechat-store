package com.tuangou.auth;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Maps a Supabase JWT to Spring authorities.
 *
 * <p>Authorities granted: {@code ROLE_USER} for any verified token, plus {@code ROLE_ADMIN} when
 * the joined {@code profiles.role} column is {@code 'admin'}. The role lookup is delegated to
 * {@link ProfileRoleResolver} so that the security layer doesn't depend on JPA directly (keeps
 * @WebMvcTest happy).
 */
@Component
public class JwtRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

  private final ProfileRoleResolver roleResolver;

  public JwtRoleConverter(ProfileRoleResolver roleResolver) {
    this.roleResolver = roleResolver;
  }

  @Override
  public Collection<GrantedAuthority> convert(Jwt jwt) {
    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

    String userId = jwt.getSubject();
    if (userId != null) {
      try {
        String role = roleResolver.resolveRole(UUID.fromString(userId));
        if ("admin".equalsIgnoreCase(role)) {
          authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
      } catch (IllegalArgumentException ignored) {
      }
    }

    Object claimRole = jwt.getClaim("role");
    if (claimRole instanceof String s && "admin".equalsIgnoreCase(s)) {
      authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    return authorities;
  }
}
