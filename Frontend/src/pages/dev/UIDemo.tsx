import { useState } from "react";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import { DataTable } from "../../components/data-table/DataTable";
import { DataTableToolbar } from "../../components/data-table/DataTableToolbar";
import { PageContent, PageHeader, PageTitle, PageDescription } from "../../components/layout/page-layout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";

type DemoStudent = {
  id: string;
  admissionNumber: string;
  name: string;
  mobile: string;
  status: "ACTIVE" | "INACTIVE";
};

const dummyData: DemoStudent[] = [
  { id: "1", admissionNumber: "ADM-001", name: "Rahul Kumar", mobile: "9876543210", status: "ACTIVE" },
  { id: "2", admissionNumber: "ADM-002", name: "Priya Singh", mobile: "9876543211", status: "ACTIVE" },
  { id: "3", admissionNumber: "ADM-003", name: "Amit Sharma", mobile: "9876543212", status: "INACTIVE" },
  { id: "4", admissionNumber: "ADM-004", name: "Neha Gupta", mobile: "9876543213", status: "ACTIVE" },
  { id: "5", admissionNumber: "ADM-005", name: "Rohan Verma", mobile: "9876543214", status: "ACTIVE" },
  { id: "6", admissionNumber: "ADM-006", name: "Kavita Yadav", mobile: "9876543215", status: "INACTIVE" },
  { id: "7", admissionNumber: "ADM-007", name: "Suresh Das", mobile: "9876543216", status: "ACTIVE" },
];

export function UIDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  const columns: ColumnDef<DemoStudent>[] = [
    {
      accessorKey: "admissionNumber",
      header: "Admission No.",
      cell: ({ row }: { row: Row<DemoStudent> }) => <div className="font-medium">{row.getValue("admissionNumber")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: Row<DemoStudent> }) => {
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
      cell: () => (
        <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
          Edit
        </Button>
      ),
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader>
        <div>
          <PageTitle>UI Foundation Demo</PageTitle>
          <PageDescription>
            Demonstrating generic components (DataTable, Dialog, Forms, Buttons)
          </PageDescription>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add Record</Button>
      </PageHeader>

      <PageContent>
        <div className="mb-8">
          <DataTable
            columns={columns}
            data={dummyData}
            toolbar={(table: Table<DemoStudent>) => <DataTableToolbar table={table} searchKey="name" />}
            mobileRenderer={(row: DemoStudent) => (
              <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{row.name}</div>
                    <div className="text-sm text-gray-500">{row.admissionNumber}</div>
                  </div>
                  <Badge variant={row.status === "ACTIVE" ? "success" : "secondary"}>
                    {row.status}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Mobile:</span> {row.mobile}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
                    Edit
                  </Button>
                </div>
              </div>
            )}
          />
        </div>

        <div className="space-y-4 border p-6 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold">Form Components Playground</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Generic Input</label>
              <Input placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Generic Select</label>
              <Select>
                <option>Option 1</option>
                <option>Option 2</option>
              </Select>
            </div>
            <div className="space-y-2 flex items-center gap-2 pt-8">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                Accept terms and conditions
              </label>
            </div>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Make changes to the record here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue="Rahul Kumar" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Save changes</Button>
          </DialogFooter>
        </Dialog>
      </PageContent>
    </div>
  );
}
