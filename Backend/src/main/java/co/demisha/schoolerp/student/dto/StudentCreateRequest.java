package co.demisha.schoolerp.student.dto;

import co.demisha.schoolerp.student.Gender;
import co.demisha.schoolerp.student.StudentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentCreateRequest {

    @NotBlank(message = "Admission number is required")
    private String admissionNumber;

    @NotBlank(message = "Name is required")
    private String name;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private Gender gender;

    private String fatherName;
    private String motherName;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String mobileNumber;

    private String address;

    @PastOrPresent(message = "Admission date cannot be in the future")
    private LocalDate admissionDate;

    private StudentStatus status = StudentStatus.ACTIVE;
}
