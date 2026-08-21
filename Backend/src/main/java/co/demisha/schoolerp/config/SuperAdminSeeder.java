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

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedSuperAdmin) {
            log.info("Super Admin seeding is disabled.");
            return;
        }

        // Check if there is already a super admin tenant
        Tenant sysTenant = tenantRepository.findByCode("SYSTEM")
                .orElseGet(() -> {
                    log.info("Creating SYSTEM tenant for SUPER_ADMIN...");
                    return tenantRepository.save(Tenant.builder()
                            .code("SYSTEM")
                            .name("System Administration")
                            .type(co.demisha.schoolerp.tenant.SchoolType.PRIVATE)
                            .board(co.demisha.schoolerp.tenant.Board.OTHER)
                            .active(true)
                            .build());
                });

        if (!userRepository.existsByUsername("superadmin")) {
            log.info("Creating default superadmin user...");
            User superAdmin = User.builder()
                    .username("superadmin")
                    // In a real app, inject this via ENV VAR. Hardcoding for this seed script convenience.
                    .password(passwordEncoder.encode("superadmin"))
                    .name("Super Administrator")
                    .email("admin@schoolerp.com")
                    .role(Role.SUPER_ADMIN)
                    .tenant(sysTenant)
                    .active(true)
                    .build();
            userRepository.save(superAdmin);
            log.info("Default superadmin created successfully.");
        } else {
            log.info("Super admin already exists.");
        }
    }
}
