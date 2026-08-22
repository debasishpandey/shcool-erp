import type { StudentResponse } from "../../../types";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface StudentDetailsProps {
  student: StudentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetails({ student, open, onOpenChange }: StudentDetailsProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Student Details</DialogTitle>
        <DialogDescription>
          Detailed record for {student.name}.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.admissionNumber}</p>
          </div>
          <Badge variant={student.status === "ACTIVE" ? "success" : "secondary"}>
            {student.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Gender</span>
            <span className="text-gray-900">{student.gender || "-"}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</span>
            <span className="text-gray-900">{student.dateOfBirth || "-"}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Admission Date</span>
            <span className="text-gray-900">{student.admissionDate || "-"}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Father's Name</span>
            <span className="text-gray-900">{student.fatherName || "-"}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Mother's Name</span>
            <span className="text-gray-900">{student.motherName || "-"}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 mb-1">Mobile</span>
            <span className="text-gray-900">{student.mobileNumber || "-"}</span>
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-gray-500 mb-1">Address</span>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
            {student.address || "No address provided."}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}
