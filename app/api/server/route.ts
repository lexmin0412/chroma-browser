import { NextResponse } from 'next/server';
import { getClient } from '@/app/utils/chroma';
import { prisma } from '@/app/utils/prisma';


// 检查服务器状态
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

    // 并行执行心跳和版本检查
    const [heartbeat, version] = await Promise.all([
      client.heartbeat(),
      client.version()
    ]);

    return NextResponse.json({
      success: true,
      heartbeat,
      version
    });
  } catch (error) {
    console.error('Error checking server status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check server status'
    }, { status: 500 });
  }
}

// 重置数据库
export async function DELETE(request: Request) {
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
    await client.reset();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset database'
    }, { status: 500 });
  }
}
