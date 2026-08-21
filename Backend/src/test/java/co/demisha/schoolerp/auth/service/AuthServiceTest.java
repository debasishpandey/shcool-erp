package co.demisha.schoolerp.auth.service;

import co.demisha.schoolerp.auth.RefreshToken;
import co.demisha.schoolerp.auth.RefreshTokenRepository;
import co.demisha.schoolerp.auth.dto.LoginRequest;
import co.demisha.schoolerp.auth.dto.LoginResponse;
import co.demisha.schoolerp.role.Role;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Tenant tenant;
    private User user;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpiration", 604800000L);

        tenant = Tenant.builder()
                .id(1L)
                .code("ABC")
                .name("ABC School")
                .active(true)
                .build();

        user = User.builder()
                .id(1L)
                .username("admin")
                .password("encoded_password")
                .name("Admin User")
                .role(Role.SCHOOL_ADMIN)
                .tenant(tenant)
                .active(true)
                .build();
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("password");
        request.setTenantCode("ABC");

        when(userRepository.findByUsernameAndTenant_Code("admin", "ABC")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded_password")).thenReturn(true);
        when(jwtService.generateToken(anyLong(), anyString(), anyLong(), any(Role.class))).thenReturn("jwt-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("admin", response.getUser().getUsername());
    }

    @Test
    void login_InvalidUser() {
        LoginRequest request = new LoginRequest();
        request.setUsername("unknown");
        request.setPassword("password");
        request.setTenantCode("ABC");
        
        when(userRepository.findByUsernameAndTenant_Code("unknown", "ABC")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_InactiveTenant() {
        tenant.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("password");
        request.setTenantCode("ABC");

        when(userRepository.findByUsernameAndTenant_Code("admin", "ABC")).thenReturn(Optional.of(user));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
