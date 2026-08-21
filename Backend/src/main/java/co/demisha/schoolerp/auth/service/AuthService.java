package co.demisha.schoolerp.auth.service;

import co.demisha.schoolerp.auth.RefreshToken;
import co.demisha.schoolerp.auth.RefreshTokenRepository;
import co.demisha.schoolerp.auth.dto.LoginRequest;
import co.demisha.schoolerp.auth.dto.LoginResponse;
import co.demisha.schoolerp.auth.dto.TokenRefreshRequest;
import co.demisha.schoolerp.auth.dto.UserResponse;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user;
        if (request.getTenantCode() != null && !request.getTenantCode().isBlank()) {
            user = userRepository.findByUsernameAndTenant_Code(request.getUsername(), request.getTenantCode())
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        } else {
            user = userRepository.findByUsernameAndTenantIsNull(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password (tenant code required for school users)"));
            if (user.getRole() != co.demisha.schoolerp.role.Role.SUPER_ADMIN) {
                throw new BadCredentialsException("Tenant code required for school users");
            }
        }

        Tenant tenant = user.getTenant();

        if (tenant != null && !tenant.isActive()) {
            throw new BadCredentialsException("Tenant is inactive");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateToken(user.getId(), user.getUsername(), tenant != null ? tenant.getId() : null, user.getRole());
        RefreshToken refreshToken = createRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BadCredentialsException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        Tenant tenant = user.getTenant();

        if (!user.isActive() || (tenant != null && !tenant.isActive())) {
            throw new BadCredentialsException("Account or tenant is inactive");
        }

        String accessToken = jwtService.generateToken(user.getId(), user.getUsername(), tenant != null ? tenant.getId() : null, user.getRole());
        
        // Optionally rotate refresh token here, but we'll just reuse it until expiration for simplicity
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(mapToUserResponse(user))
                .build();
    }
    
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plus(refreshExpiration, java.time.temporal.ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }
    
    public UserResponse getCurrentUser(Long userId, Long tenantId) {
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenant() != null ? user.getTenant().getId() : null)
                .tenantCode(user.getTenant() != null ? user.getTenant().getCode() : null)
                .tenantName(user.getTenant() != null ? user.getTenant().getName() : null)
                .build();
    }
}
