"use client";

import { useEffect, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import Editor from "@monaco-editor/react";

export interface RecordFormData {
	id: string;
	document: string;
	metadata: string;
	embedding: string;
}

interface RecordSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "add" | "edit";
	initialData: RecordFormData;
	onSubmit: (data: RecordFormData) => Promise<void>;
	operating?: boolean;
}

export function RecordSheet({
	open,
	onOpenChange,
	mode,
	initialData,
	onSubmit,
	operating = false,
}: RecordSheetProps) {
	const [formData, setFormData] = useState<RecordFormData>(initialData);

	// Reset form when opening or changing mode/data
	useEffect(() => {
		if (open) {
			setFormData(initialData);
		}
	}, [open, initialData]);

	const handleSubmit = () => {
		onSubmit(formData);
	};

	const title = mode === "add" ? "Add New Record" : "Edit Record";
	const description =
		mode === "add"
			? "Add a new record to this collection. ID is required."
			: "Update record details.";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto [&>button]:hidden flex flex-col p-0">
				<SheetHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0 sticky top-0 bg-white dark:bg-slate-950 z-10">
					<div className="space-y-1">
						<SheetTitle>{title}</SheetTitle>
						<SheetDescription>{description}</SheetDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onOpenChange(false)}
							disabled={operating}
						>
							Cancel
						</Button>
						<Button size="sm" onClick={handleSubmit} disabled={operating}>
							{operating && <Spinner className="mr-2 h-4 w-4" />}
							Confirm
						</Button>
					</div>
				</SheetHeader>

				<div className="grid gap-6 p-6">
					<div className="grid gap-2">
						<Label htmlFor="record-id">ID</Label>
						<Input
							id="record-id"
							value={formData.id}
							onChange={(e) => setFormData({ ...formData, id: e.target.value })}
							placeholder="Record ID"
							disabled={mode === "edit"}
							className={
								mode === "edit"
									? "bg-slate-100 dark:bg-slate-800 text-slate-500"
									: ""
							}
						/>
						{mode === "edit" && (
							<p className="text-xs text-slate-400">ID cannot be changed.</p>
						)}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="record-document">Document Content</Label>
						<Textarea
							id="record-document"
							value={formData.document}
							onChange={(e) =>
								setFormData({ ...formData, document: e.target.value })
							}
							placeholder="Document text content..."
							className="min-h-[100px]"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="record-metadata">Metadata (JSON)</Label>
						<div className="border rounded-md overflow-hidden">
							<Editor
								height="200px"
								defaultLanguage="json"
								theme="vs-dark"
								value={formData.metadata}
								onChange={(value) =>
									setFormData({ ...formData, metadata: value || "" })
								}
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
					</div>

					<div className="grid gap-2">
						<Label htmlFor="record-embedding">Embedding (JSON Array)</Label>
						<div className="border rounded-md overflow-hidden">
							<Editor
								height="200px"
								defaultLanguage="json"
								theme="vs-dark"
								value={formData.embedding}
								onChange={(value) =>
									setFormData({ ...formData, embedding: value || "" })
								}
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
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
