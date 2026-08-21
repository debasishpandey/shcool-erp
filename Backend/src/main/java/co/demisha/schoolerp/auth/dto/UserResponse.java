package co.demisha.schoolerp.auth.dto;

import co.demisha.schoolerp.role.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private Role role;
    private Long tenantId;
    private String tenantCode;
    private String tenantName;
}
