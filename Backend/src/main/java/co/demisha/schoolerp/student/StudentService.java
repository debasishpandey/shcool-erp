package co.demisha.schoolerp.student;

import co.demisha.schoolerp.exception.ResourceNotFoundException;
import co.demisha.schoolerp.security.TenantContext;
import co.demisha.schoolerp.student.dto.StudentCreateRequest;
import co.demisha.schoolerp.student.dto.StudentResponse;
import co.demisha.schoolerp.student.dto.StudentUpdateRequest;
import co.demisha.schoolerp.tenant.Tenant;
import co.demisha.schoolerp.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context found");
        }
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
    }

    @Transactional
    public StudentResponse createStudent(StudentCreateRequest request) {
        Tenant currentTenant = getCurrentTenant();

        if (studentRepository.existsByAdmissionNumberAndTenantId(request.getAdmissionNumber(), currentTenant.getId())) {
            throw new IllegalArgumentException("Admission number already exists in this school");
        }

        Student student = Student.builder()
                .admissionNumber(request.getAdmissionNumber())
                .name(request.getName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .fatherName(request.getFatherName())
                .motherName(request.getMotherName())
                .mobileNumber(request.getMobileNumber())
                .address(request.getAddress())
                .admissionDate(request.getAdmissionDate())
                .status(request.getStatus() != null ? request.getStatus() : StudentStatus.ACTIVE)
                .tenant(currentTenant)
                .build();

        Student savedStudent = studentRepository.save(student);
        return StudentResponse.fromEntity(savedStudent);
    }

    public List<StudentResponse> getStudents() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context found");
        }

        return studentRepository.findByTenantId(tenantId).stream()
                .map(StudentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public StudentResponse getStudentById(Long id) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context found");
        }

        Student student = studentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return StudentResponse.fromEntity(student);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context found");
        }

        Student student = studentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!student.getAdmissionNumber().equals(request.getAdmissionNumber()) &&
                studentRepository.existsByAdmissionNumberAndTenantId(request.getAdmissionNumber(), tenantId)) {
            throw new IllegalArgumentException("Admission number already exists in this school");
        }

        student.setAdmissionNumber(request.getAdmissionNumber());
        student.setName(request.getName());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setFatherName(request.getFatherName());
        student.setMotherName(request.getMotherName());
        student.setMobileNumber(request.getMobileNumber());
        student.setAddress(request.getAddress());
        student.setAdmissionDate(request.getAdmissionDate());
        if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
        }

        Student savedStudent = studentRepository.save(student);
        return StudentResponse.fromEntity(savedStudent);
    }

    @Transactional
    public StudentResponse deactivateStudent(Long id) {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No active tenant context found");
        }

        Student student = studentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        student.setStatus(StudentStatus.INACTIVE);
        Student savedStudent = studentRepository.save(student);
        return StudentResponse.fromEntity(savedStudent);
    }
}
