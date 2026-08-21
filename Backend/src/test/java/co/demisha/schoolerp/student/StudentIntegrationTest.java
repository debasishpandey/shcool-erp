package co.demisha.schoolerp.student;

import co.demisha.schoolerp.auth.service.JwtService;
import co.demisha.schoolerp.role.Role;
import co.demisha.schoolerp.student.dto.StudentCreateRequest;
import co.demisha.schoolerp.tenant.Board;
import co.demisha.schoolerp.tenant.SchoolType;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
public class StudentIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private StudentRepository studentRepository;



    private User tenantAAdmin;
    private User tenantBAdmin;
    private Tenant tenantA;
    private Tenant tenantB;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
                .build();

        studentRepository.deleteAll();
        userRepository.deleteAll();
        tenantRepository.deleteAll();

        tenantA = Tenant.builder()
                .code("TENANT_A")
                .name("Tenant A")
                .type(SchoolType.PRIVATE)
                .board(Board.OTHER)
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

        tenantB = Tenant.builder()
                .code("TENANT_B")
                .name("Tenant B")
                .type(SchoolType.PRIVATE)
                .board(Board.OTHER)
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
    void createStudent_Success() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        String requestJson = "{ \"admissionNumber\": \"ADM001\", \"name\": \"John Doe\" }";

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.admissionNumber").value("ADM001"))
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void createStudent_DuplicateAdmissionNumberInSameTenant_Rejected() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        String requestJson = "{ \"admissionNumber\": \"ADM001\", \"name\": \"John Doe\" }";

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createStudent_SameAdmissionNumberInDifferentTenant_Allowed() throws Exception {
        String tokenA = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());
        String tokenB = jwtService.generateToken(tenantBAdmin.getId(), tenantBAdmin.getUsername(), tenantB.getId(), tenantBAdmin.getRole());

        String requestJson = "{ \"admissionNumber\": \"ADM001\", \"name\": \"John Doe\" }";

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated());
    }

    @Test
    void getStudent_FromOwnTenant_Works() throws Exception {
        Student student = Student.builder()
                .admissionNumber("ADM001")
                .name("John Doe")
                .tenant(tenantA)
                .build();
        studentRepository.save(student);

        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        mockMvc.perform(get("/api/students/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void getStudent_FromOtherTenant_Blocked() throws Exception {
        Student studentA = Student.builder()
                .admissionNumber("ADM001")
                .name("John Doe")
                .tenant(tenantA)
                .build();
        studentRepository.save(studentA);

        String tokenB = jwtService.generateToken(tenantBAdmin.getId(), tenantBAdmin.getUsername(), tenantB.getId(), tenantBAdmin.getRole());

        mockMvc.perform(get("/api/students/" + studentA.getId())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void createStudent_InvalidMobileNumber_Rejected() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        String requestJson = "{ \"admissionNumber\": \"ADM001\", \"name\": \"John Doe\", \"mobileNumber\": \"123\" }";

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createStudent_FutureDateOfBirth_Rejected() throws Exception {
        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        // Assuming tomorrow's date for future DOB
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        String requestJson = "{ \"admissionNumber\": \"ADM001\", \"name\": \"John Doe\", \"dateOfBirth\": \"" + tomorrow.toString() + "\" }";

        mockMvc.perform(post("/api/students")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void deactivateStudent_StatusBecomesInactive() throws Exception {
        Student student = Student.builder()
                .admissionNumber("ADM001")
                .name("John Doe")
                .tenant(tenantA)
                .status(StudentStatus.ACTIVE)
                .build();
        studentRepository.save(student);

        String token = jwtService.generateToken(tenantAAdmin.getId(), tenantAAdmin.getUsername(), tenantA.getId(), tenantAAdmin.getRole());

        mockMvc.perform(patch("/api/students/" + student.getId() + "/deactivate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }
}
