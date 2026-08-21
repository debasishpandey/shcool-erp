package co.demisha.schoolerp.tenant;

import co.demisha.schoolerp.tenant.dto.TenantUpdateRequest;
import co.demisha.schoolerp.tenant.dto.TenantCreateRequest;
import co.demisha.schoolerp.tenant.dto.TenantDto;
import co.demisha.schoolerp.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final co.demisha.schoolerp.user.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<TenantDto> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(TenantDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TenantDto getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        return TenantDto.fromEntity(tenant);
    }

    @Transactional
    public TenantDto createTenant(TenantCreateRequest request) {
        if (tenantRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Tenant code already exists");
        }

        Tenant tenant = Tenant.builder()
                .code(request.getCode())
                .name(request.getName())
                .type(request.getType())
                .board(request.getBoard())
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .active(true)
                .build();

        Tenant savedTenant = tenantRepository.save(tenant);
        return TenantDto.fromEntity(savedTenant);
    }

    @Transactional
    public TenantDto updateTenant(Long id, TenantUpdateRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (!tenant.getCode().equals(request.getCode()) && tenantRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Tenant code already exists");
        }

        tenant.setCode(request.getCode());
        tenant.setName(request.getName());
        tenant.setType(request.getType());
        tenant.setBoard(request.getBoard());
        tenant.setAddress(request.getAddress());
        tenant.setCity(request.getCity());
        tenant.setDistrict(request.getDistrict());
        tenant.setState(request.getState());
        tenant.setPinCode(request.getPinCode());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setWebsite(request.getWebsite());
        tenant.setLogoUrl(request.getLogoUrl());

        Tenant savedTenant = tenantRepository.save(tenant);
        return TenantDto.fromEntity(savedTenant);
    }

    @Transactional
    public TenantDto updateTenantStatus(Long id, boolean active) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        tenant.setActive(active);
        Tenant savedTenant = tenantRepository.save(tenant);
        return TenantDto.fromEntity(savedTenant);
    }

    @Transactional
    public co.demisha.schoolerp.auth.dto.UserResponse createSchoolAdmin(Long tenantId, co.demisha.schoolerp.tenant.dto.SchoolAdminCreateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (!tenant.isActive()) {
            throw new IllegalArgumentException("Cannot create admin for inactive tenant");
        }

        if (userRepository.existsByUsernameAndTenantId(request.getUsername(), tenant.getId())) {
            throw new IllegalArgumentException("Username already exists in this school");
        }

        co.demisha.schoolerp.user.User admin = co.demisha.schoolerp.user.User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .mobileNumber(request.getMobileNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(co.demisha.schoolerp.role.Role.SCHOOL_ADMIN)
                .tenant(tenant)
                .active(true)
                .build();

        co.demisha.schoolerp.user.User savedAdmin = userRepository.save(admin);
        
        return co.demisha.schoolerp.auth.dto.UserResponse.builder()
                .id(savedAdmin.getId())
                .username(savedAdmin.getUsername())
                .name(savedAdmin.getName())
                .email(savedAdmin.getEmail())
                .role(savedAdmin.getRole())
                .tenantId(tenant.getId())
                .tenantCode(tenant.getCode())
                .tenantName(tenant.getName())
                .build();
    }
}
