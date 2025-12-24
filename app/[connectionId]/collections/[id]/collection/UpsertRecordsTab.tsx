import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface UpsertRecordsTabProps {
  upsertingRecords: boolean;
  upsertRecordIds: string;
  upsertRecordEmbeddings: string;
  upsertRecordMetadatas: string;
  upsertRecordDocuments: string;
  onIdsChange: (value: string) => void;
  onEmbeddingsChange: (value: string) => void;
  onMetadatasChange: (value: string) => void;
  onDocumentsChange: (value: string) => void;
  onSubmit: () => void;
}

const UpsertRecordsTab: React.FC<UpsertRecordsTabProps> = ({
  upsertingRecords,
  upsertRecordIds,
  upsertRecordEmbeddings,
  upsertRecordMetadatas,
  upsertRecordDocuments,
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
          <Label htmlFor="upsertRecordIds">Record IDs (comma separated)*</Label>
          <Input
            type="text"
            id="upsertRecordIds"
            value={upsertRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            disabled={upsertingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="upsertRecordEmbeddings">Embeddings (JSON array of arrays)</Label>
          <Input
            type="text"
            id="upsertRecordEmbeddings"
            value={upsertRecordEmbeddings}
            onChange={(e) => onEmbeddingsChange(e.target.value)}
            placeholder='e.g., [[0.1, 0.2], [0.3, 0.4]]'
            disabled={upsertingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="upsertRecordMetadatas">Metadatas (JSON array of objects)</Label>
          <Input
            type="text"
            id="upsertRecordMetadatas"
            value={upsertRecordMetadatas}
            onChange={(e) => onMetadatasChange(e.target.value)}
            placeholder='e.g., [{"key1": "value1"}, {"key2": "value2"}]'
            disabled={upsertingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="upsertRecordDocuments">Documents (comma separated)</Label>
          <Input
            type="text"
            id="upsertRecordDocuments"
            value={upsertRecordDocuments}
            onChange={(e) => onDocumentsChange(e.target.value)}
            placeholder="e.g., document1, document2"
            disabled={upsertingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={upsertingRecords || !upsertRecordIds.trim()}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/30 transition-all"
        >
          {upsertingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Upserting...</span>
            </>
          ) : 'Upsert Records'}
        </Button>
      </div>
    </div>
  );
};

export default UpsertRecordsTab;