package co.demisha.schoolerp.tenant;

import co.demisha.schoolerp.auth.dto.ApiResponse;
import co.demisha.schoolerp.tenant.dto.TenantCreateRequest;
import co.demisha.schoolerp.tenant.dto.TenantDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantDto>>> getAllTenants() {
        return ResponseEntity.ok(ApiResponse.success("Tenants fetched successfully", tenantService.getAllTenants()));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> createTenant(@Valid @RequestBody TenantCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tenant created successfully", tenantService.createTenant(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> getTenantById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Tenant fetched successfully", tenantService.getTenantById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> updateTenant(@PathVariable Long id, @Valid @RequestBody co.demisha.schoolerp.tenant.dto.TenantUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tenant updated successfully", tenantService.updateTenant(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> updateTenantStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.success("Tenant status updated", tenantService.updateTenantStatus(id, active)));
    }

    @PostMapping("/{id}/admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<co.demisha.schoolerp.auth.dto.UserResponse>> createSchoolAdmin(
            @PathVariable Long id, 
            @Valid @RequestBody co.demisha.schoolerp.tenant.dto.SchoolAdminCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("School admin created successfully", tenantService.createSchoolAdmin(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.ok(ApiResponse.success("Tenant deleted successfully", null));
    }
}
