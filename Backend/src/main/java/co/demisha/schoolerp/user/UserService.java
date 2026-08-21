package co.demisha.schoolerp.user;

import co.demisha.schoolerp.auth.dto.UserResponse;
import co.demisha.schoolerp.exception.ResourceNotFoundException;
import co.demisha.schoolerp.role.Role;
import co.demisha.schoolerp.security.TenantContext;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.dto.UserCreateRequest;
import co.demisha.schoolerp.user.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        Long tenantId = getTenantIdOrThrow();
        return userRepository.findByTenantId(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return mapToResponse(getUserEntityById(id));
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        Long tenantId = getTenantIdOrThrow();
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists in the system");
        }

        // A normal admin cannot create a SUPER_ADMIN
        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new IllegalArgumentException("Cannot create SUPER_ADMIN user from this endpoint");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .tenant(tenant)
                .active(true)
                .build();

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = getUserEntityById(id);

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getRole() != null) {
            if (request.getRole() == Role.SUPER_ADMIN) {
                throw new IllegalArgumentException("Cannot update to SUPER_ADMIN role");
            }
            user.setRole(request.getRole());
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public void updateUserStatus(Long id, boolean active) {
        User user = getUserEntityById(id);
        user.setActive(active);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserEntityById(id);
        userRepository.delete(user);
    }

    private User getUserEntityById(Long id) {
        Long tenantId = getTenantIdOrThrow();
        return userRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long getTenantIdOrThrow() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant context is required but not found");
        }
        return tenantId;
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .tenantId(user.getTenant().getId())
                .tenantCode(user.getTenant().getCode())
                .tenantName(user.getTenant().getName())
                .build();
    }
}
