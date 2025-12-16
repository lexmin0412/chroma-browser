import { NextResponse } from 'next/server';
import { ChromaClient, Collection } from 'chromadb';

// 创建 ChromaClient 实例
const getClient = (host: string, port: number) => {
  return new ChromaClient({
    host,
    port,
  });
};

// 创建集合
export async function POST(request: Request) {
  try {
    const { name, metadata, host, port } = await request.json();
    const client = getClient(host, port);

    const collection = await client.createCollection({
      name,
      metadata,
    });

    return NextResponse.json({
      success: true,
      collection: {
        name: collection.name,
        metadata: collection.metadata
      }
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection'
    }, { status: 500 });
  }
}

// 获取所有集合
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const host = searchParams.get('host');
    const port = searchParams.get('port');

    // 验证参数
    if (!host || !port) {
      return NextResponse.json({
        success: false,
        error: 'Host and port are required'
      }, { status: 400 });
    }

    const client = getClient(host, parseInt(port));
    const collections = await client.listCollections();

    // 转换集合数据格式
    const collectionData = collections.map((collection: Collection) => ({
      name: collection.name,
      metadata: collection.metadata
    }));

    return NextResponse.json({
      success: true,
      collections: collectionData
    });
  } catch (error) {
    console.error('Error listing collections:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list collections'
    }, { status: 500 });
  }
}

// 删除集合
export async function DELETE(request: Request) {
  try {
    const { name, host, port } = await request.json();
    const client = getClient(host, port);

    await client.deleteCollection({ name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete collection'
    }, { status: 500 });
  }
}
