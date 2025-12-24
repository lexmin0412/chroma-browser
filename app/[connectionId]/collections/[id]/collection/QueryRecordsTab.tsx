import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

interface QueryRecordsTabProps {
  queryingRecords: boolean;
  queryText: string;
  queryEmbedding: string;
  queryNResults: string;
  queryWhere: string;
  onQueryTextChange: (value: string) => void;
  onQueryEmbeddingChange: (value: string) => void;
  onQueryNResultsChange: (value: string) => void;
  onQueryWhereChange: (value: string) => void;
  onSubmit: () => void;
}

const QueryRecordsTab: React.FC<QueryRecordsTabProps> = ({
  queryingRecords,
  queryText,
  queryEmbedding,
  queryNResults,
  queryWhere,
  onQueryTextChange,
  onQueryEmbeddingChange,
  onQueryNResultsChange,
  onQueryWhereChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="queryText">Query Text (comma separated)</Label>
          <Input
            type="text"
            id="queryText"
            value={queryText}
            onChange={(e) => onQueryTextChange(e.target.value)}
            placeholder='e.g., "apple", "banana"'
            disabled={queryingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="queryEmbedding">Query Embedding (JSON array)</Label>
          <Input
            type="text"
            id="queryEmbedding"
            value={queryEmbedding}
            onChange={(e) => onQueryEmbeddingChange(e.target.value)}
            placeholder='e.g., [0.1, 0.2, 0.3]'
            disabled={queryingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="queryNResults">Number of Results</Label>
          <Input
            type="number"
            id="queryNResults"
            value={queryNResults}
            onChange={(e) => onQueryNResultsChange(e.target.value)}
            min="1"
            disabled={queryingRecords}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="queryWhere">Where Filter (JSON)</Label>
          <Input
            type="text"
            id="queryWhere"
            value={queryWhere}
            onChange={(e) => onQueryWhereChange(e.target.value)}
            placeholder='e.g., {"name": "apple"}'
            disabled={queryingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={queryingRecords || (!queryText.trim() && !queryEmbedding.trim())}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all"
        >
          {queryingRecords ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Querying...</span>
            </>
          ) : 'Query Records'}
        </Button>
      </div>
    </div>
  );
};

export default QueryRecordsTab;