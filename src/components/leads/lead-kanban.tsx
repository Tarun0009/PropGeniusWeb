"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { LeadCard } from "./lead-card";
import { useUpdateLeadStatus } from "@/hooks/use-leads";
import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead } from "@/types/lead";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

interface KanbanColumnProps {
  status: string;
  label: string;
  leads: Lead[];
  onLeadClick: (id: string) => void;
}

function KanbanColumn({ status, label, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 snap-start flex-col rounded-lg border bg-slate-50 transition-colors ${
        isOver ? "border-primary-400 bg-primary-50/50" : "border-slate-200"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[status] || "default"} size="sm">
            {label}
          </Badge>
          <span className="text-xs text-slate-400">{leads.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {leads.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No leads
          </p>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} data-lead-id={lead.id}>
              <DraggableLeadCard lead={lead} onClick={() => onLeadClick(lead.id)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DraggableLeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable(lead.id);

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <LeadCard lead={lead} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

function useDraggable(id: string) {
  const [isDragging, setIsDragging] = React.useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  return {
    attributes: { "data-draggable-id": id },
    listeners: {
      onPointerDown: () => setIsDragging(false),
    },
    setNodeRef: (node: HTMLDivElement | null) => {
      (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    isDragging,
    setIsDragging,
  };
}

interface LeadKanbanProps {
  leads: Lead[];
}

function LeadKanban({ leads }: LeadKanbanProps) {
  const router = useRouter();
  const updateStatusMutation = useUpdateLeadStatus();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const leadsByStatus = LEAD_STATUSES.reduce<Record<string, Lead[]>>(
    (acc, { value }) => {
      acc[value] = leads.filter((l) => l.status === value);
      return acc;
    },
    {}
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    // The active id comes from the draggable item
    const leadId = findLeadIdFromEvent(event);
    if (leadId) setActiveId(leadId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const leadId = findLeadIdFromDragEvent(active);
    const newStatus = over.id as string;

    if (!leadId || !newStatus) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== newStatus) {
      updateStatusMutation.mutate({ id: leadId, status: newStatus });
    }
  };

  // Find lead ID from drag events by walking up the DOM
  function findLeadIdFromEvent(event: DragStartEvent): string | null {
    const node = event.active.id;
    // Since we can't easily use dnd-kit's built-in draggable with our card structure,
    // we use the data-lead-id attribute approach
    const el = document.querySelector(`[data-lead-id="${node}"]`);
    return el?.getAttribute("data-lead-id") || (node as string);
  }

  function findLeadIdFromDragEvent(active: DragEndEvent["active"]): string | null {
    return active.id as string;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none">
        {LEAD_STATUSES.map(({ value, label }) => (
          <KanbanColumn
            key={value}
            status={value}
            label={label}
            leads={leadsByStatus[value] || []}
            onLeadClick={(id) => router.push(`/leads/${id}`)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export { LeadKanban };
