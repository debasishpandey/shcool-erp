package co.demisha.schoolerp.user.dto;

import co.demisha.schoolerp.role.Role;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String email;
    private Role role;
}
