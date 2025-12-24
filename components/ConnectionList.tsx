"use client";

import { Edit, Trash2, Server, Cloud, Database, Rocket } from 'lucide-react';
import { IConnectionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface ConnectionListProps {
  connections: IConnectionItem[];
  onSelect?: (connection: IConnectionItem) => void;
  onEdit?: (connection: IConnectionItem) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onLaunch?: (connection: IConnectionItem) => void;
}

export default function ConnectionList({
  connections,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  onLaunch
}: ConnectionListProps) {
  if (connections.length === 0) {
    return (
      <Empty>
        <EmptyMedia>
          <Database className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No connections configured</EmptyTitle>
          <EmptyDescription>
            Add your first vector database connection to get started.
          </EmptyDescription>
        </EmptyHeader>
        {onAdd && (
          <EmptyContent>
            <Button onClick={onAdd} variant="outline">
              Add Your First Connection
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[200px]">Connection Details</TableHead>
            <TableHead>Scope (Tenant / DB)</TableHead>
            {(onEdit || onDelete || onLaunch) && (
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {connections.map((connection) => (
            <TableRow
              key={connection.id}
              className={cn(onSelect && "cursor-pointer hover:bg-muted/50")}
              onClick={() => onSelect?.(connection)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{connection.name}</span>
                  {connection.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {connection.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex px-2 py-0.5 rounded-full text-xs font-medium border",
                  connection.type === "ChromaNormal"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                )}>
                  {connection.type.replace("Chroma", "")}
                </div>
              </TableCell>
              <TableCell>
                {connection.type === "ChromaNormal" ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    <span>{connection.config?.host}:{connection.config?.port}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Cloud className="h-3 w-3 text-muted-foreground" />
                    <span>Chroma Cloud API</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {connection.type === "ChromaCloud" ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Tenant:</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono bg-muted/50 px-1 rounded max-w-[120px] truncate block">
                            {connection.config?.tenant}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{connection.config?.tenant}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">DB:</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-mono bg-muted/50 px-1 rounded max-w-[120px] truncate block">
                            {connection.config?.database}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{connection.config?.database}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">-</span>
                )}
              </TableCell>
              {(onEdit || onDelete || onLaunch) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onLaunch && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        title="Launch Connection"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunch(connection);
                        }}
                      >
                        <Rocket className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(connection);
                        }}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(connection.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
