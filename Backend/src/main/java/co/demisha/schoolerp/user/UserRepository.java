package co.demisha.schoolerp.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "tenant")
    Optional<User> findByUsername(String username);
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "tenant")
    Optional<User> findByUsernameAndTenant_Code(String username, String tenantCode);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "tenant")
    Optional<User> findByIdAndTenantId(Long id, Long tenantId);
    
    List<User> findByTenantId(Long tenantId);
    
    void deleteByTenantId(Long tenantId);
    
    boolean existsByUsernameAndTenantId(String username, Long tenantId);
    
    boolean existsByUsername(String username);
}
