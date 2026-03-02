"use client";

import React, { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useImportLeads } from "@/hooks/use-leads";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CSVImportModal({ isOpen, onClose }: CSVImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportLeads();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!csvText.trim()) return;
    await importMutation.mutateAsync(csvText);
    setCsvText("");
    onClose();
  };

  const previewRows = csvText.trim()
    ? csvText.trim().split("\n").slice(0, 6)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Leads from CSV" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Upload a CSV file or paste CSV data. Required column: <strong>name</strong>.
          Optional: email, phone, source, budget_min, budget_max, preferred_location, notes.
        </p>

        {/* File Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-6 transition-colors hover:border-primary-400"
        >
          <Upload className="h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-600">
            Click to upload CSV file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Or paste */}
        <div className="text-center text-xs text-slate-400">or paste CSV data below</div>

        <Textarea
          placeholder="name,email,phone,source&#10;Rajesh Kumar,rajesh@email.com,+919876543210,referral&#10;Priya Sharma,priya@email.com,+919876543211,website"
          rows={5}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />

        {/* Preview */}
        {previewRows.length > 1 && (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {previewRows[0].split(",").map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-slate-600">
                      {h.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(1).map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {row.split(",").map((cell, j) => (
                      <td key={j} className="px-3 py-1.5 text-slate-700">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvText.trim().split("\n").length > 6 && (
              <p className="px-3 py-2 text-xs text-slate-400">
                ...and {csvText.trim().split("\n").length - 6} more rows
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={!csvText.trim() || importMutation.isPending}
            isLoading={importMutation.isPending}
          >
            Import Leads
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { CSVImportModal };
