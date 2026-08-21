package co.demisha.schoolerp.auth.controller;

import co.demisha.schoolerp.auth.dto.ApiResponse;
import co.demisha.schoolerp.auth.dto.LoginRequest;
import co.demisha.schoolerp.auth.dto.LoginResponse;
import co.demisha.schoolerp.auth.dto.TokenRefreshRequest;
import co.demisha.schoolerp.auth.dto.UserResponse;
import co.demisha.schoolerp.auth.service.AuthService;
import co.demisha.schoolerp.security.SecurityUser;
import co.demisha.schoolerp.security.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody TokenRefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal SecurityUser user) {
        // Double check tenant context just to be safe
        Long tenantId = TenantContext.getTenantId();
        UserResponse response = authService.getCurrentUser(user.getUser().getId(), tenantId);
        return ResponseEntity.ok(ApiResponse.success("Current user fetched", response));
    }
}
