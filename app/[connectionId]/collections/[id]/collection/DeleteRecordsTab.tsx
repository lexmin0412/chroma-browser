import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface DeleteRecordsTabProps {
  deletingRecords: boolean;
  deleteRecordIds: string;
  deleteRecordWhere: string;
  onIdsChange: (value: string) => void;
  onWhereChange: (value: string) => void;
  onSubmit: () => void;
}

const DeleteRecordsTab: React.FC<DeleteRecordsTabProps> = ({
  deletingRecords,
  deleteRecordIds,
  deleteRecordWhere,
  onIdsChange,
  onWhereChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="deleteRecordIds">Record IDs (comma separated)</Label>
          <Input
            type="text"
            id="deleteRecordIds"
            value={deleteRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            disabled={deletingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="deleteRecordWhere">Where Filter (JSON)</Label>
          <Input
            type="text"
            id="deleteRecordWhere"
            value={deleteRecordWhere}
            onChange={(e) => onWhereChange(e.target.value)}
            placeholder='e.g., {"name": "apple"}'
            disabled={deletingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={deletingRecords || (!deleteRecordIds.trim() && !deleteRecordWhere.trim())}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transition-all"
        >
          {deletingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Deleting...</span>
            </>
          ) : 'Delete Records'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteRecordsTab;