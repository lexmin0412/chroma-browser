import { NextResponse } from 'next/server';
import { getClient, getCollection } from '@/app/utils/chroma';
import { prisma } from '@/app/utils/prisma';
import type { Where } from 'chromadb';
import type { IConnectionItem } from '@/types';


// 获取记录数量
export async function OPTIONS() {
  return NextResponse.json({ success: true });
}

// 添加记录
export async function POST(request: Request) {
  try {
    const { collectionName, params, connectionId } = await request.json();

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
      }, { status: 400 });
    }

    // 从数据库获取连接配置
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'Connection not found'
      }, { status: 404 });
    }

    const client = getClient(connection as unknown as IConnectionItem);
    const collection = await getCollection(client, collectionName);

    const result = await collection.add(params);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error adding records:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add records'
    }, { status: 500 });
  }
}

// 获取记录或记录数量
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const action = searchParams.get('action') || 'get'; // 'get' or 'count'
    const connectionId = searchParams.get('connectionId');

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
      }, { status: 400 });
    }

    if (!collectionName) {
      return NextResponse.json({
        success: false,
        error: 'Collection name is required'
      }, { status: 400 });
    }

    // 从数据库获取连接配置
    const connection = await prisma.connection.findUnique({
      where: { id: parseInt(connectionId) }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'Connection not found'
      }, { status: 404 });
    }

    const client = getClient(connection as unknown as IConnectionItem);
    const collection = await getCollection(client, collectionName);

    if (action === 'count') {
      // 获取记录数量
      const count = await collection.count();
      return NextResponse.json({ success: true, count });
    } else {
      // 获取记录
      // 从查询参数中提取参数
      const idsParam = searchParams.get('ids');
      const limitParam = searchParams.get('limit');
      const offsetParam = searchParams.get('offset');
      const includeParam = searchParams.get('include');
      const whereDocumentParam = searchParams.get('whereDocument');
      const whereParam = searchParams.get('where');

      interface GetParams {
        ids?: string[];
        limit?: number;
        offset?: number;
        where?: Where;
        whereDocument?: import('chromadb').WhereDocument;
        include?: ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[];
      }

      const params: GetParams = {};

      if (idsParam) {
        params.ids = idsParam.split(',');
      }

      if (limitParam) {
        params.limit = parseInt(limitParam);
      }

      if (offsetParam) {
        params.offset = parseInt(offsetParam);
      }

      if (whereParam) {
        try {
          params.where = JSON.parse(whereParam);
        } catch {
          // 如果解析失败，忽略where参数
        }
      }

      if (whereDocumentParam) {
        try {
          params.whereDocument = JSON.parse(whereDocumentParam);
        } catch {
          // 解析失败时忽略
        }
      }

      if (includeParam) {
        const allowed = new Set(['distances', 'documents', 'embeddings', 'metadatas', 'uris']);
        const parts = includeParam.split(',').map(s => s.trim()).filter(Boolean);
        params.include = parts.filter(p => allowed.has(p)) as ('distances' | 'documents' | 'embeddings' | 'metadatas' | 'uris')[];
      }

      const result = await collection.get(params);
      return NextResponse.json({ success: true, result });
    }
  } catch (error) {
    console.error('Error getting records:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get records'
    }, { status: 500 });
  }
}

// 查询记录
export async function PUT(request: Request) {
  try {
    const { collectionName, params, connectionId } = await request.json();

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
      }, { status: 400 });
    }

    // 从数据库获取连接配置
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'Connection not found'
      }, { status: 404 });
    }

    const client = getClient(connection as unknown as IConnectionItem);
    const collection = await getCollection(client, collectionName);

    const result = await collection.query(params);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error querying records:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query records'
    }, { status: 500 });
  }
}

// 删除记录
export async function DELETE(request: Request) {
  try {
    const { collectionName, params, connectionId } = await request.json();

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
      }, { status: 400 });
    }

    // 从数据库获取连接配置
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'Connection not found'
      }, { status: 404 });
    }

    const client = getClient(connection as unknown as IConnectionItem);
    const collection = await getCollection(client, collectionName);

    const result = await collection.delete(params);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error deleting records:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete records'
    }, { status: 500 });
  }
}

// 更新记录
export async function PATCH(request: Request) {
  try {
    const { collectionName, params, connectionId } = await request.json();

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
      }, { status: 400 });
    }

    // 从数据库获取连接配置
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return NextResponse.json({
        success: false,
        error: 'Connection not found'
      }, { status: 404 });
    }

    const client = getClient(connection as unknown as IConnectionItem);
    const collection = await getCollection(client, collectionName);

    const result = await collection.update(params);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error updating records:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update records'
    }, { status: 500 });
  }
}
