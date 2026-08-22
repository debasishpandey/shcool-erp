import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import type { StudentResponse } from "../../../types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../context/ToastContext";
import { Select } from "../../../components/ui/select";
import { FormLabel, FormControl, FormMessage, FormItem } from "../../../components/forms/form";
import { handleApiValidationErrors } from "../../../utils/errorHandler";

const studentSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  name: z.string().min(1, "Name is required"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number").optional().or(z.literal("")),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  admissionDate: z.string().optional(),
  address: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudentFormValues) => Promise<void>;
  isSubmitting: boolean;
  editingStudent: StudentResponse | null;
}

export function StudentForm({ open, onOpenChange, onSubmit, isSubmitting, editingStudent }: StudentFormProps) {
  const { showToast } = useToast();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      admissionNumber: editingStudent?.admissionNumber || "",
      name: editingStudent?.name || "",
      mobileNumber: editingStudent?.mobileNumber || "",
      fatherName: editingStudent?.fatherName || "",
      motherName: editingStudent?.motherName || "",
      gender: editingStudent?.gender,
      dateOfBirth: editingStudent?.dateOfBirth || "",
      admissionDate: editingStudent?.admissionDate || "",
      address: editingStudent?.address || "",
    }
  });

  const handleFormSubmit = async (data: StudentFormValues) => {
    try {
      await onSubmit(data);
    } catch (err: any) {
      if (!handleApiValidationErrors(err, form, showToast)) {
        showToast("Unable to save student. Please try again.", "error");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => !isSubmitting && onOpenChange(val)}>
      <DialogHeader>
        <DialogTitle>{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogDescription>
          {editingStudent ? "Update the details of the student." : "Enter the details for the new student."}
        </DialogDescription>
      </DialogHeader>
      <div className="overflow-y-auto max-h-[60vh] py-4 px-1 -mx-1">
        <form id="student-form" onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {
          const fieldLabels: Record<string, string> = { admissionNumber: "Admission Number", name: "Student Name", mobileNumber: "Mobile Number" };
          const missingFields = Object.keys(errors).map(key => fieldLabels[key] || key);
          showToast(`Please complete the required fields: ${missingFields.join(", ")}`, "error");
        })} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel required>Admission Number</FormLabel>
              <FormControl>
                <Input {...form.register("admissionNumber")} disabled={!!editingStudent} />
              </FormControl>
              {form.formState.errors.admissionNumber && <FormMessage>{form.formState.errors.admissionNumber.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel required>Student Name</FormLabel>
              <FormControl>
                <Input {...form.register("name")} />
              </FormControl>
              {form.formState.errors.name && <FormMessage>{form.formState.errors.name.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input {...form.register("mobileNumber")} placeholder="10 digit number" />
              </FormControl>
              {form.formState.errors.mobileNumber && <FormMessage>{form.formState.errors.mobileNumber.message}</FormMessage>}
            </FormItem>

            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select {...form.register("gender")}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </Select>
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Father Name</FormLabel>
              <FormControl>
                <Input {...form.register("fatherName")} />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Mother Name</FormLabel>
              <FormControl>
                <Input {...form.register("motherName")} />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...form.register("dateOfBirth")} />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Admission Date</FormLabel>
              <FormControl>
                <Input type="date" {...form.register("admissionDate")} />
              </FormControl>
            </FormItem>
          </div>
          
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...form.register("address")} />
            </FormControl>
          </FormItem>
        </form>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
        <Button form="student-form" type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Student
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
