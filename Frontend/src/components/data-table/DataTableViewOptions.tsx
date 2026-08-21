import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { Button } from "../ui/button";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="ml-auto hidden h-8 lg:flex"
        onClick={() => setOpen(!open)}
      >
        <Settings2 className="mr-2 h-4 w-4" />
        View
      </Button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-48 rounded-md border bg-white p-2 shadow-md">
          <div className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Toggle columns
          </div>
          <div className="space-y-1">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <label
                    key={column.id}
                    className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      checked={column.getIsVisible()}
                      onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                    />
                    <span className="text-sm capitalize">{column.id}</span>
                  </label>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
