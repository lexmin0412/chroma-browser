import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface UpdateRecordsTabProps {
  updatingRecords: boolean;
  updateRecordIds: string;
  updateRecordEmbeddings: string;
  updateRecordMetadatas: string;
  updateRecordDocuments: string;
  onIdsChange: (value: string) => void;
  onEmbeddingsChange: (value: string) => void;
  onMetadatasChange: (value: string) => void;
  onDocumentsChange: (value: string) => void;
  onSubmit: () => void;
}

const UpdateRecordsTab: React.FC<UpdateRecordsTabProps> = ({
  updatingRecords,
  updateRecordIds,
  updateRecordEmbeddings,
  updateRecordMetadatas,
  updateRecordDocuments,
  onIdsChange,
  onEmbeddingsChange,
  onMetadatasChange,
  onDocumentsChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="updateRecordIds">Record IDs (comma separated)*</Label>
          <Input
            type="text"
            id="updateRecordIds"
            value={updateRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="updateRecordEmbeddings">Embeddings (JSON array of arrays)</Label>
          <Input
            type="text"
            id="updateRecordEmbeddings"
            value={updateRecordEmbeddings}
            onChange={(e) => onEmbeddingsChange(e.target.value)}
            placeholder='e.g., [[0.1, 0.2], [0.3, 0.4]]'
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="updateRecordMetadatas">Metadatas (JSON array of objects)</Label>
          <Input
            type="text"
            id="updateRecordMetadatas"
            value={updateRecordMetadatas}
            onChange={(e) => onMetadatasChange(e.target.value)}
            placeholder='e.g., [{"key1": "value1"}, {"key2": "value2"}]'
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="updateRecordDocuments">Documents (comma separated)</Label>
          <Input
            type="text"
            id="updateRecordDocuments"
            value={updateRecordDocuments}
            onChange={(e) => onDocumentsChange(e.target.value)}
            placeholder="e.g., document1, document2"
            disabled={updatingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={updatingRecords || !updateRecordIds.trim()}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          {updatingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Updating...</span>
            </>
          ) : 'Update Records'}
        </Button>
      </div>
    </div>
  );
};

export default UpdateRecordsTab;