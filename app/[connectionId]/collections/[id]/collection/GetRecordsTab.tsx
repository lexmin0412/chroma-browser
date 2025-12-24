import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface GetRecordsTabProps {
  fetchingRecords: boolean;
  getRecordIds: string;
  getRecordLimit: string;
  getRecordWhere: string;
  onIdsChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onWhereChange: (value: string) => void;
  onSubmit: () => void;
}

const GetRecordsTab: React.FC<GetRecordsTabProps> = ({
  fetchingRecords,
  getRecordIds,
  getRecordLimit,
  getRecordWhere,
  onIdsChange,
  onLimitChange,
  onWhereChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="getRecordIds">Record IDs (comma separated)</Label>
          <Input
            type="text"
            id="getRecordIds"
            value={getRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            disabled={fetchingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="getRecordLimit">Limit</Label>
          <Input
            type="number"
            id="getRecordLimit"
            value={getRecordLimit}
            onChange={(e) => onLimitChange(e.target.value)}
            min="1"
            disabled={fetchingRecords}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="getRecordWhere">Where Filter (JSON)</Label>
          <Input
            type="text"
            id="getRecordWhere"
            value={getRecordWhere}
            onChange={(e) => onWhereChange(e.target.value)}
            placeholder='e.g., {"name": {"$eq": "apple"}}'
            disabled={fetchingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={fetchingRecords}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          {fetchingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Fetching...</span>
            </>
          ) : 'Get Records'}
        </Button>
      </div>
    </div>
  );
};

export default GetRecordsTab;