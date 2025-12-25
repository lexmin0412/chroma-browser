"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Editor from "@monaco-editor/react";
import { Spinner } from "@/components/ui/spinner";

interface CollectionFormProps {
  initialName?: string;
  initialMetadata?: Record<string, unknown> | null;
  allowEditName?: boolean;
  submitting?: boolean;
  onSubmit: (data: { name: string; metadata?: Record<string, unknown> | null }) => void;
  onCancel?: () => void;
}

export default function CollectionForm({
  initialName,
  initialMetadata,
  allowEditName = true,
  submitting = false,
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState(initialName || "");
  const [metadataText, setMetadataText] = useState<string>(
    initialMetadata ? JSON.stringify(initialMetadata, null, 2) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const metadataPlaceholder = useMemo(
    () => `{
  "description": "My collection",
  "version": "1.0"
}`,
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }
    if (!/^[a-zA-Z0-9\\-_]{3,63}$/.test(name)) {
      setError("Collection name must be 3-63 chars, alphanumeric, '-' or '_'");
      return;
    }

    let metadata: Record<string, unknown> | null = null;
    if (metadataText.trim()) {
      try {
        const parsed = JSON.parse(metadataText);
        if (
          typeof parsed !== "object" ||
          Array.isArray(parsed) ||
          parsed === null
        ) {
          setError("Metadata must be a valid JSON object");
          return;
        }
        metadata = parsed;
      } catch (err) {
        setError("Invalid JSON: " + (err as Error).message);
        return;
      }
    }

    onSubmit({ name, metadata });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="collection-name">Collection Name</Label>
        <Input
          id="collection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!allowEditName || submitting}
          placeholder="my_collection"
        />
      </div>

      <div className="grid gap-2">
        <Label>Metadata (JSON, optional)</Label>
        <div className="border rounded-md overflow-hidden">
          <Editor
            height="240px"
            defaultLanguage="json"
            theme="vs-dark"
            value={metadataText}
            onChange={(val: string | undefined) => setMetadataText(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Example:
          <pre className="mt-1 p-2 rounded bg-muted overflow-x-auto">{metadataPlaceholder}</pre>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="cursor-pointer">
          {submitting ? (
            <>
              <Spinner className="h-4 w-4" />
              <span>Saving...</span>
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}
