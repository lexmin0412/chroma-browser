import React from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

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
        <div className="col-span-2">
          <label htmlFor="updateRecordIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Record IDs (comma separated)*
          </label>
          <input
            type="text"
            id="updateRecordIds"
            value={updateRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="updateRecordEmbeddings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Embeddings (JSON array of arrays)
          </label>
          <input
            type="text"
            id="updateRecordEmbeddings"
            value={updateRecordEmbeddings}
            onChange={(e) => onEmbeddingsChange(e.target.value)}
            placeholder='e.g., [[0.1, 0.2], [0.3, 0.4]]'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="updateRecordMetadatas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Metadatas (JSON array of objects)
          </label>
          <input
            type="text"
            id="updateRecordMetadatas"
            value={updateRecordMetadatas}
            onChange={(e) => onMetadatasChange(e.target.value)}
            placeholder='e.g., [{"key1": "value1"}, {"key2": "value2"}]'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={updatingRecords}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="updateRecordDocuments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Documents (comma separated)
          </label>
          <input
            type="text"
            id="updateRecordDocuments"
            value={updateRecordDocuments}
            onChange={(e) => onDocumentsChange(e.target.value)}
            placeholder="e.g., document1, document2"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={updatingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={updatingRecords || !updateRecordIds.trim()}
          className="px-4 py-2 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:from-violet-400 disabled:to-purple-400 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 disabled:shadow-none flex items-center"
        >
          {updatingRecords ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Updating...</span>
            </>
          ) : 'Update Records'}
        </button>
      </div>
    </div>
  );
};

export default UpdateRecordsTab;