"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCreateLead } from "@/hooks/use-leads";
import { LEAD_SOURCES } from "@/lib/constants";

interface QuickAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddLeadModal({ isOpen, onClose }: QuickAddLeadModalProps) {
  const createMutation = useCreateLead();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("phone");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [nameError, setNameError] = useState("");

  const handleClose = () => {
    setName("");
    setPhone("");
    setSource("phone");
    setBudgetMin("");
    setBudgetMax("");
    setNameError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError("");

    await createMutation.mutateAsync({
      name: name.trim(),
      phone: phone.trim() || null,
      source: source as "phone",
      budget_min: budgetMin ? Number(budgetMin) : undefined,
      budget_max: budgetMax ? Number(budgetMax) : undefined,
      status: "new",
    } as Parameters<typeof createMutation.mutateAsync>[0]);

    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add Lead" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Add a lead fast — fill in the essentials now, complete details later.
        </p>

        <Input
          label="Name *"
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(""); }}
          error={nameError}
          autoFocus
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Select
          label="Source"
          options={[...LEAD_SOURCES]}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Budget Min (₹)"
            type="number"
            placeholder="e.g. 5000000"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
          />
          <Input
            label="Budget Max (₹)"
            type="number"
            placeholder="e.g. 10000000"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Add Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
}
