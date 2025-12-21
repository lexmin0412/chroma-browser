import React from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface AddRecordsTabProps {
  addingRecords: boolean;
  newRecordIds: string;
  newRecordEmbeddings: string;
  newRecordMetadatas: string;
  newRecordDocuments: string;
  onIdsChange: (value: string) => void;
  onEmbeddingsChange: (value: string) => void;
  onMetadatasChange: (value: string) => void;
  onDocumentsChange: (value: string) => void;
  onSubmit: () => void;
}

const AddRecordsTab: React.FC<AddRecordsTabProps> = ({
  addingRecords,
  newRecordIds,
  newRecordEmbeddings,
  newRecordMetadatas,
  newRecordDocuments,
  onIdsChange,
  onEmbeddingsChange,
  onMetadatasChange,
  onDocumentsChange,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="recordIds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Record IDs (comma separated)
          </label>
          <input
            type="text"
            id="recordIds"
            value={newRecordIds}
            onChange={(e) => onIdsChange(e.target.value)}
            placeholder="e.g., id1, id2, id3"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={addingRecords}
          />
        </div>
        <div>
          <label htmlFor="recordEmbeddings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Embeddings (JSON array)
          </label>
          <input
            type="text"
            id="recordEmbeddings"
            value={newRecordEmbeddings}
            onChange={(e) => onEmbeddingsChange(e.target.value)}
            placeholder='e.g., [[0.1, 0.2], [0.3, 0.4]]'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={addingRecords}
          />
        </div>
        <div>
          <label htmlFor="recordMetadatas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Metadatas (JSON array)
          </label>
          <input
            type="text"
            id="recordMetadatas"
            value={newRecordMetadatas}
            onChange={(e) => onMetadatasChange(e.target.value)}
            placeholder='e.g., [{"name": "doc1"}, {"name": "doc2"}]'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={addingRecords}
          />
        </div>
        <div>
          <label htmlFor="recordDocuments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Documents (comma separated)
          </label>
          <input
            type="text"
            id="recordDocuments"
            value={newRecordDocuments}
            onChange={(e) => onDocumentsChange(e.target.value)}
            placeholder='e.g., "Document 1", "Document 2"'
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
            disabled={addingRecords}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={addingRecords || !newRecordIds.trim()}
          className="px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:from-indigo-400 disabled:to-blue-400 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 disabled:shadow-none flex items-center"
        >
          {addingRecords ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Adding...</span>
            </>
          ) : 'Add Records'}
        </button>
      </div>
    </div>
  );
};

export default AddRecordsTab;