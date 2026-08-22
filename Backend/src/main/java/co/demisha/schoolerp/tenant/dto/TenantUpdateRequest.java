package co.demisha.schoolerp.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TenantUpdateRequest {
    @NotBlank(message = "School code is required")
    private String code;

    @NotBlank(message = "School name is required")
    private String name;

    @jakarta.validation.constraints.NotNull(message = "School type is required")
    private co.demisha.schoolerp.tenant.SchoolType type;

    @jakarta.validation.constraints.NotNull(message = "Board is required")
    private co.demisha.schoolerp.tenant.Board board;

    private String address;
    private String city;
    private String district;
    private String state;
    
    @jakarta.validation.constraints.Pattern(regexp = "^$|^\\d{6}$", message = "PIN code must be 6 digits")
    private String pinCode;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;

    private String website;
    
    private String logoUrl;
}
