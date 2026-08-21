import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Ban, Loader2 } from "lucide-react";

import { studentService } from "../../services/studentService";
import type { StudentResponse } from "../../types";

import { PageHeader, PageTitle, PageDescription, PageContent } from "../../components/layout/page-layout";
import { DataTable } from "../../components/data-table/DataTable";
import { DataTableToolbar } from "../../components/data-table/DataTableToolbar";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { FormLabel, FormControl, FormMessage, FormItem } from "../../components/forms/form";
import { Spinner } from "../../components/ui/spinner";

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

type StudentFormValues = z.infer<typeof studentSchema>;

export default function Students() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deactivate Modal State
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [studentToDeactivate, setStudentToDeactivate] = useState<StudentResponse | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      admissionNumber: "",
      name: "",
      mobileNumber: "",
      fatherName: "",
      motherName: "",
      gender: undefined,
      dateOfBirth: "",
      admissionDate: "",
      address: "",
    }
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    form.reset({
      admissionNumber: "",
      name: "",
      mobileNumber: "",
      fatherName: "",
      motherName: "",
      gender: undefined,
      dateOfBirth: "",
      admissionDate: "",
      address: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentResponse) => {
    setEditingStudent(student);
    form.reset({
      admissionNumber: student.admissionNumber,
      name: student.name,
      mobileNumber: student.mobileNumber || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      gender: student.gender,
      dateOfBirth: student.dateOfBirth || "",
      admissionDate: student.admissionDate || "",
      address: student.address || "",
    });
    setIsFormOpen(true);
  };

  const handleOpenDeactivate = (student: StudentResponse) => {
    setStudentToDeactivate(student);
    setIsDeactivateOpen(true);
  };

  const onSubmitForm = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean up empty strings to undefined to avoid validation issues on backend
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])
      ) as any;

      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, cleanData);
      } else {
        await studentService.createStudent(cleanData);
      }
      setIsFormOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDeactivate = async () => {
    if (!studentToDeactivate) return;
    setIsDeactivating(true);
    try {
      await studentService.deactivateStudent(studentToDeactivate.id);
      setIsDeactivateOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to deactivate student");
    } finally {
      setIsDeactivating(false);
    }
  };

  const columns: ColumnDef<StudentResponse>[] = [
    {
      accessorKey: "admissionNumber",
      header: "Admission No.",
      cell: ({ row }: { row: Row<StudentResponse> }) => <div className="font-medium text-gray-900">{row.getValue("admissionNumber")}</div>,
    },
    {
      accessorKey: "name",
      header: "Student Name",
    },
    {
      accessorKey: "fatherName",
      header: "Father Name",
      cell: ({ row }: { row: Row<StudentResponse> }) => <div className="text-gray-500">{row.getValue("fatherName") || "-"}</div>,
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile",
      cell: ({ row }: { row: Row<StudentResponse> }) => <div>{row.getValue("mobileNumber") || "-"}</div>,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }: { row: Row<StudentResponse> }) => <div>{row.getValue("gender") || "-"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<StudentResponse> }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
            {status}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: Row<StudentResponse> }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(student)} title="Edit">
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            {student.status === "ACTIVE" && (
              <Button variant="ghost" size="icon" onClick={() => handleOpenDeactivate(student)} title="Deactivate">
                <Ban className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      },
    }
  ];

  const mobileCardRenderer = (student: StudentResponse) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-lg text-gray-900">{student.name}</div>
          <div className="text-sm text-gray-500">{student.admissionNumber}</div>
        </div>
        <Badge variant={student.status === "ACTIVE" ? "success" : "secondary"}>
          {student.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        <div>
          <span className="text-gray-500 block text-xs">Father</span>
          {student.fatherName || "-"}
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Mobile</span>
          {student.mobileNumber || "-"}
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-gray-100 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(student)}>
          Edit
        </Button>
        {student.status === "ACTIVE" && (
          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleOpenDeactivate(student)}>
            Deactivate
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Students</PageTitle>
          <PageDescription>
            Manage the school's student records.
          </PageDescription>
        </div>
        <Button onClick={handleOpenAdd}>+ Add Student</Button>
      </PageHeader>

      <PageContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchStudents} variant="outline">Try Again</Button>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No students yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start digitizing your school's student register.</p>
            <Button onClick={handleOpenAdd}>+ Add Student</Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={students}
            toolbar={(table) => <DataTableToolbar table={table} searchKey="name" />}
            mobileRenderer={mobileCardRenderer}
          />
        )}
      </PageContent>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !isSubmitting && setIsFormOpen(open)}>
        <DialogHeader>
          <DialogTitle>{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
          <DialogDescription>
            {editingStudent ? "Update the details of the student." : "Enter the details for the new student."}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] py-4 px-1 -mx-1">
          <form id="student-form" onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Admission Number *</FormLabel>
                <FormControl>
                  <Input {...form.register("admissionNumber")} disabled={!!editingStudent} />
                </FormControl>
                {form.formState.errors.admissionNumber && <FormMessage>{form.formState.errors.admissionNumber.message}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Student Name *</FormLabel>
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
          <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button form="student-form" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Student
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={isDeactivateOpen} onOpenChange={(open) => !isDeactivating && setIsDeactivateOpen(open)}>
        <DialogHeader>
          <DialogTitle>Deactivate Student?</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate <strong>{studentToDeactivate?.name}</strong>? The student record will remain available for historical records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeactivateOpen(false)} disabled={isDeactivating}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirmDeactivate} disabled={isDeactivating}>
            {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
