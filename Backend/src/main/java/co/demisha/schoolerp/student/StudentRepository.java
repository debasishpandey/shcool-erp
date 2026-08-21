package co.demisha.schoolerp.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByTenantId(Long tenantId);

    Optional<Student> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByAdmissionNumberAndTenantId(String admissionNumber, Long tenantId);
}
