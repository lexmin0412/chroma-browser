import { NextResponse } from 'next/server';
import { getClient } from '@/app/utils/chroma';
import { prisma } from '@/app/utils/prisma';


// 创建集合
export async function POST(request: Request) {
  try {
    const { name, metadata, connectionId } = await request.json();

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

    const client = getClient(connection);

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
    const connectionId = searchParams.get('connectionId');

    // 验证参数
    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'Connection ID is required'
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

    const client = getClient(connection);
    const collections = await client.listCollections();

    // 转换集合数据格式
    const collectionData = collections.map((collection) => ({
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
    const { name, connectionId } = await request.json();

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

    const client = getClient(connection);
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
