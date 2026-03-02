"use client";

import { Modal } from "@/components/ui/modal";
import { WHATSAPP_TEMPLATES } from "@/lib/constants";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: { name: string; content: string }) => void;
  leadName: string;
  orgName?: string;
}

function TemplateSelector({ isOpen, onClose, onSelect, leadName, orgName }: TemplateSelectorProps) {
  const handleSelect = (template: (typeof WHATSAPP_TEMPLATES)[number]) => {
    // Substitute variables
    const content = template.content
      .replace(/\{\{name\}\}/g, leadName)
      .replace(/\{\{org\}\}/g, orgName || "our team")
      .replace(/\{\{property\}\}/g, "the property")
      .replace(/\{\{price\}\}/g, "the updated price");

    onSelect({ name: template.name, content });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Message Templates" size="md">
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          Select a template to use. Variables will be replaced automatically.
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
    </Modal>
  );
}

export { TemplateSelector };
