package co.demisha.schoolerp.student.dto;

import co.demisha.schoolerp.student.Gender;
import co.demisha.schoolerp.student.Student;
import co.demisha.schoolerp.student.StudentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class StudentResponse {

    private Long id;
    private String admissionNumber;
    private String name;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String fatherName;
    private String motherName;
    private String mobileNumber;
    private String address;
    private LocalDate admissionDate;
    private StudentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StudentResponse fromEntity(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .admissionNumber(student.getAdmissionNumber())
                .name(student.getName())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .fatherName(student.getFatherName())
                .motherName(student.getMotherName())
                .mobileNumber(student.getMobileNumber())
                .address(student.getAddress())
                .admissionDate(student.getAdmissionDate())
                .status(student.getStatus())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
