"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WHATSAPP_TEMPLATES } from "@/lib/constants";
import {
  useCustomTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "@/hooks/use-templates";

const TEMPLATE_CATEGORIES = [
  { value: "greeting", label: "Greeting" },
  { value: "follow_up", label: "Follow Up" },
  { value: "site_visit", label: "Site Visit" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closing", label: "Closing" },
  { value: "other", label: "Other" },
];

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: { name: string; content: string }) => void;
  leadName: string;
  orgName?: string;
}

function TemplateSelector({ isOpen, onClose, onSelect, leadName, orgName }: TemplateSelectorProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");

  const { data: customTemplates = [] } = useCustomTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const substituteVars = (text: string) =>
    text
      .replace(/\{\{name\}\}/g, leadName)
      .replace(/\{\{org\}\}/g, orgName || "our team")
      .replace(/\{\{property\}\}/g, "the property")
      .replace(/\{\{price\}\}/g, "the updated price");

  const handleSelect = (template: { name: string; content: string }) => {
    onSelect({ name: template.name, content: substituteVars(template.content) });
    onClose();
  };

  const resetForm = () => {
    setName("");
    setContent("");
    setCategory("other");
    setEditingId(null);
    setShowBuilder(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, name: name.trim(), content: content.trim(), category });
    } else {
      await createMutation.mutateAsync({ name: name.trim(), content: content.trim(), category });
    }
    resetForm();
  };

  const handleEdit = (template: { id: string; name: string; content: string; category: string }) => {
    setEditingId(template.id);
    setName(template.name);
    setContent(template.content);
    setCategory(template.category);
    setShowBuilder(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + `{{${variable}}}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Message Templates" size="lg">
      <div className="space-y-4">
        {showBuilder ? (
          /* Template Builder Form */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingId ? "Edit Template" : "Create Template"}
              </h3>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            <Input
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Special Offer"
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={TEMPLATE_CATEGORIES}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Message Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your template message... Use {{name}}, {{property}}, {{price}}, {{org}} as variables."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-500">Insert:</span>
                {["name", "org", "property", "price"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-primary-600 hover:bg-primary-50"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>

            {content && (
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-500">Preview:</p>
                <p className="text-sm text-slate-700">{substituteVars(content)}</p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={!name.trim() || !content.trim() || createMutation.isPending || updateMutation.isPending}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="w-full"
            >
              {editingId ? "Update Template" : "Save Template"}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Select a template or create your own.</p>
              <Button size="sm" variant="outline" onClick={() => setShowBuilder(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create
              </Button>
            </div>

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your Templates
                </p>
                <div className="space-y-2">
                  {customTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group flex items-start gap-2 rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                    >
                      <button
                        onClick={() => handleSelect({ name: template.name, content: template.content })}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{template.name}</p>
                          <Badge size="sm">{template.category}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{template.content}</p>
                      </button>
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(template)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Built-in Templates */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Built-in Templates
              </p>
              <div className="space-y-2">
                {WHATSAPP_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleSelect(template)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/50"
                  >
                    <p className="text-sm font-medium text-slate-900">{template.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{template.content}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export { TemplateSelector };
