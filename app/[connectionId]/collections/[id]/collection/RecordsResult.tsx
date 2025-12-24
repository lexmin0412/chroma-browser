import React from 'react';
import type { GetResult, QueryResult, Metadata } from 'chromadb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecordsResultProps {
  records: GetResult<Metadata> | QueryResult<Metadata> | null;
}

const RecordsResult: React.FC<RecordsResultProps> = ({ records }) => {
  if (!records || Object.keys(records).length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Query Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-muted p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm">
            {JSON.stringify(records, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordsResult;