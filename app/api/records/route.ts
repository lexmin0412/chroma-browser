import { NextResponse } from 'next/server';
import { ChromaClient, Collection } from 'chromadb';

// 创建 ChromaClient 实例
const getClient = (host: string, port: number) => {
  return new ChromaClient({
    host,
    port,
  });
};

// 获取集合实例
const getCollection = async (client: ChromaClient, name: string): Promise<Collection> => {
  return await client.getCollection({ name });
};

// 获取记录数量
export async function OPTIONS() {
  return NextResponse.json({ success: true });
}

// 添加记录
export async function POST(request: Request) {
  try {
    const { collectionName, params, host, port } = await request.json();
    const client = getClient(host, port);
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
    const host = searchParams.get('host');
    const port = searchParams.get('port');

    // 验证参数
    if (!host || !port) {
      return NextResponse.json({
        success: false,
        error: 'Host and port are required'
      }, { status: 400 });
    }

    if (!collectionName) {
      return NextResponse.json({
        success: false,
        error: 'Collection name is required'
      }, { status: 400 });
    }

    const client = getClient(host, parseInt(port));
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
      const whereParam = searchParams.get('where');

      const params: any = {};

      if (idsParam) {
        params.ids = idsParam.split(',');
      }

      if (limitParam) {
        params.limit = parseInt(limitParam);
      }

      if (whereParam) {
        try {
          params.where = JSON.parse(whereParam);
        } catch (e) {
          // 如果解析失败，忽略where参数
        }
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
    const { collectionName, params, host, port } = await request.json();

    // 验证参数
    if (!host || !port) {
      return NextResponse.json({
        success: false,
        error: 'Host and port are required'
      }, { status: 400 });
    }

    const client = getClient(host, port);
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
    const { collectionName, params, host, port } = await request.json();

    // 验证参数
    if (!host || !port) {
      return NextResponse.json({
        success: false,
        error: 'Host and port are required'
      }, { status: 400 });
    }

    const client = getClient(host, port);
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
    const { collectionName, params, host, port } = await request.json();

    // 验证参数
    if (!host || !port) {
      return NextResponse.json({
        success: false,
        error: 'Host and port are required'
      }, { status: 400 });
    }

    const client = getClient(host, port);
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
