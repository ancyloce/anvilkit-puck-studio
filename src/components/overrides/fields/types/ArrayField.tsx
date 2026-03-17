"use client";
import * as React from "react";
import { AutoField } from "@puckeditor/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Copy, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemActions,
  ItemGroup,
} from "@/components/ui/item";
import {
  Popover,
  PopoverTrigger,
  PopoverPanel,
} from "@/components/animate-ui/components/base/popover";
import { FieldLabel } from "../FieldWrapper";

interface ArrayItem {
  [key: string]: unknown;
}

interface ArrayFieldDef {
  type: "array";
  arrayFields: Record<
    string,
    { type: string; label?: string; [key: string]: unknown }
  >;
  getItemSummary?: (item: unknown, index: number) => string;
  defaultItemProps?:
    | Record<string, unknown>
    | ((index: number) => Record<string, unknown>);
  max?: number;
  min?: number;
  label?: string;
}

interface ArrayFieldProps {
  field: ArrayFieldDef;
  value: ArrayItem[];
  onChange: (value: ArrayItem[]) => void;
  id?: string;
  readOnly?: boolean;
  label?: string;
  name?: string;
  children?: React.ReactNode;
}

interface SortableItemProps {
  id: string;
  index: number;
  item: ArrayItem;
  field: ArrayFieldDef;
  readOnly?: boolean;
  atMax: boolean;
  atMin: boolean;
  fieldId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicate: (i: number) => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, subName: string, val: unknown) => void;
  getSummary: (item: ArrayItem, i: number) => string;
}

function SortableItem({
  id,
  index,
  item,
  field,
  readOnly,
  atMax,
  atMin,
  fieldId,
  open,
  onOpenChange,
  onDuplicate,
  onRemove,
  onUpdate,
  getSummary,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Popover open={open} onOpenChange={onOpenChange}>
        <Item variant="outline" size="sm" className="cursor-pointer">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-0.5 text-muted-foreground/40 hover:text-muted-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0" />
          </button>
          <PopoverTrigger className="flex-1 min-w-0 text-left">
            <ItemContent>
              <ItemTitle className="text-xs">
                {getSummary(item, index)}
              </ItemTitle>
            </ItemContent>
          </PopoverTrigger>
          {!readOnly && (
            <ItemActions>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={atMax}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(index);
                }}
                title="Duplicate"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive"
                disabled={atMin}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </ItemActions>
          )}
        </Item>
        <PopoverPanel
          side="left"
          sideOffset={60}
          align="start"
          alignOffset={-14}
          className="w-56 p-3 flex flex-col gap-2"
        >
          {Object.entries(field.arrayFields).map(([subName, subField]) => (
            <AutoField
              key={subName}
              field={{ ...subField, label: subField.label ?? subName } as any}
              value={item[subName]}
              onChange={(val) => onUpdate(index, subName, val)}
              readOnly={readOnly}
              id={`${fieldId}-${index}-${subName}`}
            />
          ))}
        </PopoverPanel>
      </Popover>
    </div>
  );
}

export function ArrayField({
  field,
  value = [],
  onChange,
  readOnly,
  label,
  id = "",
}: ArrayFieldProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Persist a stable _id on each item so dnd-kit identity survives reorders.
  // We write the id back into the array on first render and whenever new items
  // arrive without one (e.g. from external data or defaultItemProps).
  const stableValue = React.useMemo(() => {
    const needsId = value.some((item) => !item._id);
    if (!needsId) return value;
    return value.map((item) =>
      item._id ? item : { ...item, _id: `${id}-${Math.random().toString(36).slice(2)}` },
    );
  }, [value, id]);

  const itemIds = stableValue.map((item) => item._id as string);

  const atMax = field.max !== undefined && stableValue.length >= field.max;
  const atMin = field.min !== undefined && stableValue.length <= field.min;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = itemIds.indexOf(active.id as string);
    const to = itemIds.indexOf(over.id as string);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(stableValue, from, to));
  };

  const defaultItem = (): ArrayItem => {
    if (!field.defaultItemProps) return {};
    return typeof field.defaultItemProps === "function"
      ? field.defaultItemProps(value.length)
      : { ...field.defaultItemProps };
  };

  const addItem = () => {
    if (atMax || readOnly) return;
    const newIndex = stableValue.length;
    onChange([...stableValue, defaultItem()]);
    setOpenIndex(newIndex);
  };

  const removeItem = (i: number) => {
    if (atMin || readOnly) return;
    const next = [...stableValue];
    next.splice(i, 1);
    onChange(next);
  };

  const duplicateItem = (i: number) => {
    if (atMax || readOnly) return;
    const next = [...stableValue];
    next.splice(i + 1, 0, { ...stableValue[i] });
    onChange(next);
  };

  const updateItem = (i: number, subName: string, val: unknown) => {
    onChange(
      stableValue.map((item, idx) =>
        idx === i ? { ...item, [subName]: val } : item,
      ),
    );
  };

  const getSummary = (item: ArrayItem, i: number): string => {
    if (field.getItemSummary) return field.getItemSummary(item, i);
    const first = Object.entries(item).find(
      ([k, v]) => k !== "_id" && typeof v === "string" && v,
    );
    return (first?.[1] as string) || `Item ${i + 1}`;
  };

  return (
    <FieldLabel label={label ?? field.label ?? ""} readOnly={readOnly} el="div">
      <div className="flex flex-col gap-1.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <ItemGroup>
              {stableValue.map((item, i) => (
                <SortableItem
                  key={itemIds[i]}
                  id={itemIds[i]}
                  index={i}
                  item={item}
                  field={field}
                  readOnly={readOnly}
                  atMax={atMax}
                  atMin={atMin}
                  fieldId={id}
                  open={openIndex === i}
                  onOpenChange={(o) => setOpenIndex(o ? i : null)}
                  onDuplicate={duplicateItem}
                  onRemove={removeItem}
                  onUpdate={updateItem}
                  getSummary={getSummary}
                />
              ))}
            </ItemGroup>
          </SortableContext>
        </DndContext>

        {!readOnly && !atMax && (
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full gap-1.5 mt-0.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Button>
        )}
      </div>
    </FieldLabel>
  );
}
