import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface AddRecordsTabProps {
  addingRecords: boolean;
  newRecordIds: string;
  newRecordEmbeddings: string;
  newRecordMetadatas: string;
  newRecordDocuments: string;
  onIdsChange: (value: string) => void;
  onEmbeddingsChange: (value: string) => void;
  onMetadatasChange: (value: string) => void;
  onDocumentsChange: (value: string) => void;
  onSubmit: () => void;
}

const AddRecordsTab: React.FC<AddRecordsTabProps> = ({
  addingRecords,
  newRecordIds,
  newRecordEmbeddings,
  newRecordMetadatas,
  newRecordDocuments,
  onIdsChange,
  onEmbeddingsChange,
  onMetadatasChange,
  onDocumentsChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recordIds">Record IDs (comma separated)</Label>
          <Input
            type="text"
            id="recordIds"
            value={newRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            disabled={addingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recordEmbeddings">Embeddings (JSON array)</Label>
          <Input
            type="text"
            id="recordEmbeddings"
            value={newRecordEmbeddings}
            onChange={(e) => onEmbeddingsChange(e.target.value)}
            placeholder='e.g., [[0.1, 0.2], [0.3, 0.4]]'
            disabled={addingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recordMetadatas">Metadatas (JSON array)</Label>
          <Input
            type="text"
            id="recordMetadatas"
            value={newRecordMetadatas}
            onChange={(e) => onMetadatasChange(e.target.value)}
            placeholder='e.g., [{"name": "doc1"}, {"name": "doc2"}]'
            disabled={addingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recordDocuments">Documents (comma separated)</Label>
          <Input
            type="text"
            id="recordDocuments"
            value={newRecordDocuments}
            onChange={(e) => onDocumentsChange(e.target.value)}
            placeholder='e.g., "Document 1", "Document 2"'
            disabled={addingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={addingRecords || !newRecordIds.trim()}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          {addingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Adding...</span>
            </>
          ) : 'Add Records'}
        </Button>
      </div>
    </div>
  );
};

export default AddRecordsTab;