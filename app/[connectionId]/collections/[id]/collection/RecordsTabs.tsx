import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="space-y-6">
      <Tabs value={activeRecordTab} onValueChange={setActiveRecordTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="add">Add</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="get">Get</TabsTrigger>
          <TabsTrigger value="delete">Delete</TabsTrigger>
          <TabsTrigger value="update">Update</TabsTrigger>
          <TabsTrigger value="upsert">Upsert</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="add" className="mt-0">
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
          </TabsContent>

          <TabsContent value="query" className="mt-0">
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
          </TabsContent>

          <TabsContent value="get" className="mt-0">
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
          </TabsContent>

          <TabsContent value="delete" className="mt-0">
            <DeleteRecordsTab
              deletingRecords={deletingRecords}
              deleteRecordIds={deleteRecordIds}
              deleteRecordWhere={deleteRecordWhere}
              onIdsChange={onDeleteRecordIdsChange}
              onWhereChange={onDeleteRecordWhereChange}
              onSubmit={onDeleteRecords}
            />
          </TabsContent>

          <TabsContent value="update" className="mt-0">
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
          </TabsContent>

          <TabsContent value="upsert" className="mt-0">
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
          </TabsContent>
        </div>
      </Tabs>

      {records && <RecordsResult records={records} />}
    </div>
  );
};

export default RecordsTabs;
