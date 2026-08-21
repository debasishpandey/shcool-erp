package co.demisha.schoolerp.security;

import co.demisha.schoolerp.auth.service.JwtService;
import co.demisha.schoolerp.role.Role;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class SecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    private User superAdmin;
    private User tenantAAdmin;
    private User tenantBAdmin;
    private Tenant tenantA;
    private Tenant tenantB;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity()).build();

        // Clean up
        userRepository.deleteAll();
        tenantRepository.deleteAll();

        // Create SUPER_ADMIN
        superAdmin = User.builder()
                .username("superadmin-test")
                .password("password")
                .name("Super Admin")
                .email("super@test.com")
                .role(Role.SUPER_ADMIN)
                .active(true)
                .build();
        superAdmin = userRepository.save(superAdmin);

        // Create Tenant A
        tenantA = Tenant.builder()
                .code("TENANT_A")
                .name("Tenant A")
                .type(co.demisha.schoolerp.tenant.SchoolType.PRIVATE)
                .board(co.demisha.schoolerp.tenant.Board.OTHER)
                .active(true)
                .build();
        tenantA = tenantRepository.save(tenantA);

        tenantAAdmin = User.builder()
                .username("adminA")
                .password("password")
                .name("Admin A")
                .email("admina@test.com")
                .role(Role.SCHOOL_ADMIN)
                .tenant(tenantA)
                .active(true)
                .build();
        tenantAAdmin = userRepository.save(tenantAAdmin);

        // Create Tenant B
        tenantB = Tenant.builder()
                .code("TENANT_B")
                .name("Tenant B")
                .type(co.demisha.schoolerp.tenant.SchoolType.PRIVATE)
                .board(co.demisha.schoolerp.tenant.Board.OTHER)
                .active(true)
                .build();
        tenantB = tenantRepository.save(tenantB);

        tenantBAdmin = User.builder()
                .username("adminB")
                .password("password")
                .name("Admin B")
                .email("adminb@test.com")
                .role(Role.SCHOOL_ADMIN)
                .tenant(tenantB)
                .active(true)
                .build();
        tenantBAdmin = userRepository.save(tenantBAdmin);
    }

    @Test
    void superAdmin_CanAccessTenantsEndpoint_RoleAuthorization() throws Exception {
        String token = jwtService.generateToken(superAdmin.getId(), superAdmin.getUsername(), null, superAdmin.getRole());

        mockMvc.perform(get("/api/tenants")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_CannotAccessTenantsEndpoint_RoleAuthorization() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        mockMvc.perform(get("/api/tenants")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void schoolAdmin_CanAccessOwnTenantUsers_CrossTenantAccess() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        mockMvc.perform(get("/api/users/" + tenantAAdmin.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_CannotAccessOtherTenantUsers_CrossTenantAccess() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        mockMvc.perform(get("/api/users/" + tenantBAdmin.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound()); // ResourceNotFoundException thrown by getUserEntityById due to Tenant isolation
    }
}
