"use client";

import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGenerateAIContent } from "@/hooks/use-listings";
import type { GenerateListingRequest, AIListingContent } from "@/lib/validations";

interface AIGeneratorProps {
  propertyData: GenerateListingRequest;
  value: Partial<AIListingContent> | null;
  onChange: (content: AIListingContent) => void;
  onFieldChange: (field: keyof AIListingContent, value: string | string[]) => void;
}

function AIGenerator({ propertyData, value, onChange, onFieldChange }: AIGeneratorProps) {
  const generateMutation = useGenerateAIContent();

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync(propertyData);
    onChange(result);
  };

  const isGenerating = generateMutation.isPending;

  if (!value) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-16">
        <div className="rounded-full bg-info-50 p-4">
          <Sparkles className="h-8 w-8 text-info-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Generate with AI
        </h3>
        <p className="mt-1 max-w-sm text-center text-sm text-slate-500">
          Let AI create a professional listing title, description, highlights, and social media post based on your property details.
        </p>
        <Button
          className="mt-6"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={isGenerating}
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          AI-Generated Content
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={isGenerating}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate All
        </Button>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-slate-500">
            Generating fresh content...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Title */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Property Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={value.title || ""}
                onChange={(e) => onFieldChange("title", e.target.value)}
                placeholder="Property title"
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={value.description || ""}
                onChange={(e) => onFieldChange("description", e.target.value)}
                rows={6}
                placeholder="Property description"
              />
            </CardContent>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Key Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(value.highlights || []).map((highlight, index) => (
                <Input
                  key={index}
                  value={highlight}
                  onChange={(e) => {
                    const updated = [...(value.highlights || [])];
                    updated[index] = e.target.value;
                    onFieldChange("highlights", updated);
                  }}
                  placeholder={`Highlight ${index + 1}`}
                />
              ))}
            </CardContent>
          </Card>

          {/* Social Post */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Social Media Post</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={value.social_post || ""}
                onChange={(e) => onFieldChange("social_post", e.target.value)}
                rows={3}
                placeholder="Instagram/Facebook post"
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="SEO Title"
                value={value.seo_title || ""}
                onChange={(e) => onFieldChange("seo_title", e.target.value)}
                placeholder="Meta title"
              />
              <Textarea
                label="SEO Description"
                value={value.seo_description || ""}
                onChange={(e) => onFieldChange("seo_description", e.target.value)}
                rows={2}
                placeholder="Meta description"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export { AIGenerator };
