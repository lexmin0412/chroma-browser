import React from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
        <div>
          <label htmlFor="getRecordIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Record IDs (comma separated)
          </label>
          <input
            type="text"
            id="getRecordIds"
            value={getRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={fetchingRecords}
          />
        </div>
        <div>
          <label htmlFor="getRecordLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Limit
          </label>
          <input
            type="number"
            id="getRecordLimit"
            value={getRecordLimit}
            onChange={(e) => onLimitChange(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={fetchingRecords}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="getRecordWhere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Where Filter (JSON)
          </label>
          <input
            type="text"
            id="getRecordWhere"
            value={getRecordWhere}
            onChange={(e) => onWhereChange(e.target.value)}
            placeholder='e.g., {"name": {"$eq": "apple"}}'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={fetchingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={fetchingRecords}
          className="px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-violet-400 disabled:to-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 disabled:shadow-none flex items-center"
        >
          {fetchingRecords ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Fetching...</span>
            </>
          ) : 'Get Records'}
        </button>
      </div>
    </div>
  );
};

export default GetRecordsTab;