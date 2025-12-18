import React from 'react';
import AddRecordsTab from './AddRecordsTab';
import QueryRecordsTab from './QueryRecordsTab';
import GetRecordsTab from './GetRecordsTab';
import DeleteRecordsTab from './DeleteRecordsTab';
import UpdateRecordsTab from './UpdateRecordsTab';
import UpsertRecordsTab from './UpsertRecordsTab';
import RecordsResult from './RecordsResult';
import type { GetResult, QueryResult, Metadata } from 'chromadb';

interface RecordsTabsProps {
  // Tab state
  activeRecordTab: string;
  setActiveRecordTab: (tab: string) => void;

  // Add records state
  addingRecords: boolean;
  newRecordIds: string;
  newRecordEmbeddings: string;
  newRecordMetadatas: string;
  newRecordDocuments: string;
  onNewRecordIdsChange: (value: string) => void;
  onNewRecordEmbeddingsChange: (value: string) => void;
  onNewRecordMetadatasChange: (value: string) => void;
  onNewRecordDocumentsChange: (value: string) => void;
  onAddRecords: () => void;

  // Query records state
  queryingRecords: boolean;
  queryText: string;
  queryEmbedding: string;
  queryNResults: string;
  queryWhere: string;
  onQueryTextChange: (value: string) => void;
  onQueryEmbeddingChange: (value: string) => void;
  onQueryNResultsChange: (value: string) => void;
  onQueryWhereChange: (value: string) => void;
  onQueryRecords: () => void;

  // Get records state
  fetchingRecords: boolean;
  getRecordIds: string;
  getRecordLimit: string;
  getRecordWhere: string;
  onGetRecordIdsChange: (value: string) => void;
  onGetRecordLimitChange: (value: string) => void;
  onGetRecordWhereChange: (value: string) => void;
  onGetRecords: () => void;

  // Delete records state
  deletingRecords: boolean;
  deleteRecordIds: string;
  deleteRecordWhere: string;
  onDeleteRecordIdsChange: (value: string) => void;
  onDeleteRecordWhereChange: (value: string) => void;
  onDeleteRecords: () => void;

  // Update records state
  updatingRecords: boolean;
  updateRecordIds: string;
  updateRecordEmbeddings: string;
  updateRecordMetadatas: string;
  updateRecordDocuments: string;
  onUpdateRecordIdsChange: (value: string) => void;
  onUpdateRecordEmbeddingsChange: (value: string) => void;
  onUpdateRecordMetadatasChange: (value: string) => void;
  onUpdateRecordDocumentsChange: (value: string) => void;
  onUpdateRecords: () => void;

  // Upsert records state
  upsertingRecords: boolean;
  upsertRecordIds: string;
  upsertRecordEmbeddings: string;
  upsertRecordMetadatas: string;
  upsertRecordDocuments: string;
  onUpsertRecordIdsChange: (value: string) => void;
  onUpsertRecordEmbeddingsChange: (value: string) => void;
  onUpsertRecordMetadatasChange: (value: string) => void;
  onUpsertRecordDocumentsChange: (value: string) => void;
  onUpsertRecords: () => void;

  // Results
  records: GetResult<Metadata> | QueryResult<Metadata> | null;
}

const RecordsTabs: React.FC<RecordsTabsProps> = ({
  activeRecordTab,
  setActiveRecordTab,
  addingRecords,
  newRecordIds,
  newRecordEmbeddings,
  newRecordMetadatas,
  newRecordDocuments,
  onNewRecordIdsChange,
  onNewRecordEmbeddingsChange,
  onNewRecordMetadatasChange,
  onNewRecordDocumentsChange,
  onAddRecords,
  queryingRecords,
  queryText,
  queryEmbedding,
  queryNResults,
  queryWhere,
  onQueryTextChange,
  onQueryEmbeddingChange,
  onQueryNResultsChange,
  onQueryWhereChange,
  onQueryRecords,
  fetchingRecords,
  getRecordIds,
  getRecordLimit,
  getRecordWhere,
  onGetRecordIdsChange,
  onGetRecordLimitChange,
  onGetRecordWhereChange,
  onGetRecords,
  deletingRecords,
  deleteRecordIds,
  deleteRecordWhere,
  onDeleteRecordIdsChange,
  onDeleteRecordWhereChange,
  onDeleteRecords,
  updatingRecords,
  updateRecordIds,
  updateRecordEmbeddings,
  updateRecordMetadatas,
  updateRecordDocuments,
  onUpdateRecordIdsChange,
  onUpdateRecordEmbeddingsChange,
  onUpdateRecordMetadatasChange,
  onUpdateRecordDocumentsChange,
  onUpdateRecords,
  upsertingRecords,
  upsertRecordIds,
  upsertRecordEmbeddings,
  upsertRecordMetadatas,
  upsertRecordDocuments,
  onUpsertRecordIdsChange,
  onUpsertRecordEmbeddingsChange,
  onUpsertRecordMetadatasChange,
  onUpsertRecordDocumentsChange,
  onUpsertRecords,
  records
}) => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveRecordTab('add')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'add' ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Add Records
          </button>
          <button
            onClick={() => setActiveRecordTab('query')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'query' ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Query Records
          </button>
          <button
            onClick={() => setActiveRecordTab('get')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'get' ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Get Records
          </button>
          <button
            onClick={() => setActiveRecordTab('delete')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'delete' ? 'bg-linear-to-r from-red-600 to-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Delete Records
          </button>
          <button
            onClick={() => setActiveRecordTab('update')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'update' ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Update Records
          </button>
          <button
            onClick={() => setActiveRecordTab('upsert')}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeRecordTab === 'upsert' ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            Upsert Records
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeRecordTab === 'add' && (
          <AddRecordsTab
            addingRecords={addingRecords}
            newRecordIds={newRecordIds}
            newRecordEmbeddings={newRecordEmbeddings}
            newRecordMetadatas={newRecordMetadatas}
            newRecordDocuments={newRecordDocuments}
            onIdsChange={onNewRecordIdsChange}
            onEmbeddingsChange={onNewRecordEmbeddingsChange}
            onMetadatasChange={onNewRecordMetadatasChange}
            onDocumentsChange={onNewRecordDocumentsChange}
            onSubmit={onAddRecords}
          />
        )}

        {activeRecordTab === 'query' && (
          <QueryRecordsTab
            queryingRecords={queryingRecords}
            queryText={queryText}
            queryEmbedding={queryEmbedding}
            queryNResults={queryNResults}
            queryWhere={queryWhere}
            onQueryTextChange={onQueryTextChange}
            onQueryEmbeddingChange={onQueryEmbeddingChange}
            onQueryNResultsChange={onQueryNResultsChange}
            onQueryWhereChange={onQueryWhereChange}
            onSubmit={onQueryRecords}
          />
        )}

        {activeRecordTab === 'get' && (
          <GetRecordsTab
            fetchingRecords={fetchingRecords}
            getRecordIds={getRecordIds}
            getRecordLimit={getRecordLimit}
            getRecordWhere={getRecordWhere}
            onIdsChange={onGetRecordIdsChange}
            onLimitChange={onGetRecordLimitChange}
            onWhereChange={onGetRecordWhereChange}
            onSubmit={onGetRecords}
          />
        )}

        {activeRecordTab === 'delete' && (
          <DeleteRecordsTab
            deletingRecords={deletingRecords}
            deleteRecordIds={deleteRecordIds}
            deleteRecordWhere={deleteRecordWhere}
            onIdsChange={onDeleteRecordIdsChange}
            onWhereChange={onDeleteRecordWhereChange}
            onSubmit={onDeleteRecords}
          />
        )}

        {activeRecordTab === 'update' && (
          <UpdateRecordsTab
            updatingRecords={updatingRecords}
            updateRecordIds={updateRecordIds}
            updateRecordEmbeddings={updateRecordEmbeddings}
            updateRecordMetadatas={updateRecordMetadatas}
            updateRecordDocuments={updateRecordDocuments}
            onIdsChange={onUpdateRecordIdsChange}
            onEmbeddingsChange={onUpdateRecordEmbeddingsChange}
            onMetadatasChange={onUpdateRecordMetadatasChange}
            onDocumentsChange={onUpdateRecordDocumentsChange}
            onSubmit={onUpdateRecords}
          />
        )}

        {activeRecordTab === 'upsert' && (
          <UpsertRecordsTab
            upsertingRecords={upsertingRecords}
            upsertRecordIds={upsertRecordIds}
            upsertRecordEmbeddings={upsertRecordEmbeddings}
            upsertRecordMetadatas={upsertRecordMetadatas}
            upsertRecordDocuments={upsertRecordDocuments}
            onIdsChange={onUpsertRecordIdsChange}
            onEmbeddingsChange={onUpsertRecordEmbeddingsChange}
            onMetadatasChange={onUpsertRecordMetadatasChange}
            onDocumentsChange={onUpsertRecordDocumentsChange}
            onSubmit={onUpsertRecords}
          />
        )}

        <RecordsResult records={records} />
      </div>
    </div>
  );
};

export default RecordsTabs;
