import React from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
        <div>
          <label htmlFor="deleteRecordIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Record IDs (comma separated)
          </label>
          <input
            type="text"
            id="deleteRecordIds"
            value={deleteRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={deletingRecords}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="deleteRecordWhere" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Where Filter (JSON)
          </label>
          <input
            type="text"
            id="deleteRecordWhere"
            value={deleteRecordWhere}
            onChange={(e) => onWhereChange(e.target.value)}
            placeholder='e.g., {"name": "apple"}'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={deletingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={deletingRecords || (!deleteRecordIds.trim() && !deleteRecordWhere.trim())}
          className="px-4 py-2 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all disabled:from-red-400 disabled:to-orange-400 shadow-lg hover:shadow-xl hover:shadow-orange-500/30 disabled:shadow-none flex items-center"
        >
          {deletingRecords ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Deleting...</span>
            </>
          ) : 'Delete Records'}
        </button>
      </div>
    </div>
  );
};

export default DeleteRecordsTab;