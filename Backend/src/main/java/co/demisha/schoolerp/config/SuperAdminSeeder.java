package co.demisha.schoolerp.config;

import co.demisha.schoolerp.role.Role;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import co.demisha.schoolerp.user.User;
import co.demisha.schoolerp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuperAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.super-admin:true}")
    private boolean seedSuperAdmin;

    @Value("${app.seed.super-admin.username:superadmin}")
    private String superAdminUsername;

    @Value("${app.seed.super-admin.password:superadmin}")
    private String superAdminPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedSuperAdmin) {
            log.info("Super Admin seeding is disabled.");
            return;
        }

        if (!userRepository.findByUsernameAndTenantIsNull(superAdminUsername).isPresent()) {
            log.info("Creating default superadmin user...");
            User superAdmin = User.builder()
                    .username(superAdminUsername)
                    .password(passwordEncoder.encode(superAdminPassword))
                    .name("Super Administrator")
                    .email("admin@schoolerp.com")
                    .role(Role.SUPER_ADMIN)
                    .tenant(null)
                    .active(true)
                    .build();
            userRepository.save(superAdmin);
            log.info("Default superadmin created successfully.");
        } else {
            log.info("Super admin already exists.");
        }
    }
}
