import { useState, useEffect, useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Ban, Loader2, Eye } from "lucide-react";

import { studentService } from "../../services/studentService";
import type { StudentResponse } from "../../types";
import { useToast } from "../../context/ToastContext";

import { PageHeader, PageTitle, PageDescription, PageContent } from "../../components/layout/page-layout";
import { DataTable } from "../../components/data-table/DataTable";
import { DataTableToolbar } from "../../components/data-table/DataTableToolbar";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Spinner } from "../../components/ui/spinner";
import { Select } from "../../components/ui/select";

import { StudentForm, type StudentFormValues } from "./components/StudentForm";
import { StudentDetails } from "./components/StudentDetails";

export default function Students() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentResponse | null>(null);

  // Deactivate State
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [studentToDeactivate, setStudentToDeactivate] = useState<StudentResponse | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
      showToast("Unable to load students. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    // Key change to force re-render with empty defaultValues is managed inside StudentForm via useEffect or by passing a new key if needed,
    // but the Dialog destroys/re-creates form state naturally when we pass editingStudent.
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: StudentResponse) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleOpenView = (student: StudentResponse) => {
    setViewingStudent(student);
    setIsViewOpen(true);
  };

  const handleOpenDeactivate = (student: StudentResponse) => {
    setStudentToDeactivate(student);
    setIsDeactivateOpen(true);
  };

  const onSubmitForm = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === "" ? undefined : v])
      ) as any;

      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, cleanData);
        showToast("Student updated successfully.", "success");
      } else {
        await studentService.createStudent(cleanData);
        showToast("Student added successfully.", "success");
      }
      setIsFormOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      showToast("Unable to save student. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDeactivate = async () => {
    if (!studentToDeactivate) return;
    setIsDeactivating(true);
    try {
      await studentService.deactivateStudent(studentToDeactivate.id);
      showToast("Student deactivated.", "success");
      setIsDeactivateOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      showToast("Unable to deactivate student. Please try again.", "error");
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
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleOpenView(student)} title="View">
              <Eye className="h-4 w-4 text-gray-600" />
            </Button>
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

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (genderFilter && s.gender !== genderFilter) return false;
      return true;
    });
  }, [students, statusFilter, genderFilter]);

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
      
      <div className="grid grid-cols-2 gap-2 text-sm mt-1">
        <div>
          <span className="text-gray-500 block text-xs">Father</span>
          {student.fatherName || "-"}
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Mobile</span>
          {student.mobileNumber || "-"}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-gray-600" onClick={() => handleOpenView(student)}>
          View
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-blue-600" onClick={() => handleOpenEdit(student)}>
          Edit
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader>
        <div>
          <PageTitle>Students</PageTitle>
          <PageDescription>
            Manage the school's student records
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
          <div className="text-center py-16 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No students yet</h3>
            <p className="text-sm text-gray-500 mb-4">Start digitizing your school's student register.</p>
            <Button onClick={handleOpenAdd}>+ Add Student</Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            toolbar={(table) => (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1">
                  <DataTableToolbar table={table} searchKey="name" />
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-[110px] h-8 text-xs bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Select>
                  <Select 
                    value={genderFilter} 
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-[110px] h-8 text-xs bg-white"
                  >
                    <option value="">All Genders</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
              </div>
            )}
            mobileRenderer={mobileCardRenderer}
          />
        )}
      </PageContent>

      <StudentForm
        // Re-mount the form completely when opening for add vs edit to reset internal hook-form state 
        key={editingStudent ? `edit-${editingStudent.id}` : "add-new"}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={onSubmitForm}
        isSubmitting={isSubmitting}
        editingStudent={editingStudent}
      />

      <StudentDetails
        student={viewingStudent}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

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
