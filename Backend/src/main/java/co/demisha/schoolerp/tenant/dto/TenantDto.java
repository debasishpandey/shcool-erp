package co.demisha.schoolerp.tenant.dto;

import co.demisha.schoolerp.tenant.Tenant;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TenantDto {
    private Long id;
    private String code;
    private String name;
    private co.demisha.schoolerp.tenant.SchoolType type;
    private co.demisha.schoolerp.tenant.Board board;
    private String address;
    private String city;
    private String district;
    private String state;
    private String pinCode;
    private String phone;
    private String email;
    private String website;
    private String logoUrl;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TenantDto fromEntity(Tenant tenant) {
        return TenantDto.builder()
                .id(tenant.getId())
                .code(tenant.getCode())
                .name(tenant.getName())
                .type(tenant.getType())
                .board(tenant.getBoard())
                .address(tenant.getAddress())
                .city(tenant.getCity())
                .district(tenant.getDistrict())
                .state(tenant.getState())
                .pinCode(tenant.getPinCode())
                .phone(tenant.getPhone())
                .email(tenant.getEmail())
                .website(tenant.getWebsite())
                .logoUrl(tenant.getLogoUrl())
                .active(tenant.isActive())
                .createdAt(tenant.getCreatedAt())
                .updatedAt(tenant.getUpdatedAt())
                .build();
    }
}
