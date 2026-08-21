
import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { cn } from "../../lib/utils";

interface SortableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function SortableHeader<TData, TValue>({
  header,
}: SortableHeaderProps<TData, TValue>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: (isDragging ? "relative" : "static") as any,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-gray-500",
        isDragging && "opacity-50 bg-gray-100"
      )}
      colSpan={header.colSpan}
    >
      {header.isPlaceholder ? null : (
        <div className="flex items-center gap-2">
          {header.column.getCanSort() ? (
            <button
              onClick={header.column.getToggleSortingHandler()}
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
              {{
                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                desc: <ArrowDown className="ml-2 h-4 w-4" />,
              }[header.column.getIsSorted() as string] ?? null}
            </button>
          ) : (
            <span>
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
            </span>
          )}
          
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 ml-auto"
            title="Drag to reorder column"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      )}
    </th>
  );
}
