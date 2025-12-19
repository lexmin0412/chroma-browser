import React from 'react';
import type { GetResult, QueryResult, Metadata } from 'chromadb';

interface RecordsResultProps {
  records: GetResult<Metadata> | QueryResult<Metadata> | null;
}

const RecordsResult: React.FC<RecordsResultProps> = ({ records }) => {
  if (!records || Object.keys(records).length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Query Results</h4>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto shadow-inner">
        <pre className="text-sm text-gray-700 dark:text-gray-300">
          {JSON.stringify(records, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RecordsResult;