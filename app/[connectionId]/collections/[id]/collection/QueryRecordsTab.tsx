import React from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
        <div>
          <label htmlFor="queryText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Query Text (comma separated)
          </label>
          <input
            type="text"
            id="queryText"
            value={queryText}
            onChange={(e) => onQueryTextChange(e.target.value)}
            placeholder='e.g., "apple", "banana"'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={queryingRecords}
          />
        </div>
        <div>
          <label htmlFor="queryEmbedding" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Query Embedding (JSON array)
          </label>
          <input
            type="text"
            id="queryEmbedding"
            value={queryEmbedding}
            onChange={(e) => onQueryEmbeddingChange(e.target.value)}
            placeholder='e.g., [0.1, 0.2, 0.3]'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={queryingRecords}
          />
        </div>
        <div>
          <label htmlFor="queryNResults" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Results
          </label>
          <input
            type="number"
            id="queryNResults"
            value={queryNResults}
            onChange={(e) => onQueryNResultsChange(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={queryingRecords}
          />
        </div>
        <div>
          <label htmlFor="queryWhere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Where Filter (JSON)
          </label>
          <input
            type="text"
            id="queryWhere"
            value={queryWhere}
            onChange={(e) => onQueryWhereChange(e.target.value)}
            placeholder='e.g., {"name": "apple"}'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={queryingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={queryingRecords || (!queryText.trim() && !queryEmbedding.trim())}
          className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:from-indigo-400 disabled:to-blue-400 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none flex items-center"
        >
          {queryingRecords ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Querying...</span>
            </>
          ) : 'Query Records'}
        </button>
      </div>
    </div>
  );
};

export default QueryRecordsTab;