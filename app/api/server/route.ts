
import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import type { IConnectionItem } from '@/types';
import { VectorClientFactory } from '@/lib/vector-sdk/factory';

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

    const client = await VectorClientFactory.getClient(connection as unknown as IConnectionItem);

    // 并行执行心跳和版本检查
    const [heartbeat, version] = await Promise.all([
      client.heartbeat ? client.heartbeat() : Promise.resolve(0),
      client.version ? client.version() : Promise.resolve('unknown')
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

    const client = await VectorClientFactory.getClient(connection as unknown as IConnectionItem);
    
    if (client.reset) {
        await client.reset();
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({
            success: false,
            error: "Reset operation is not supported for this connection type"
        }, { status: 501 });
    }

  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset database'
    }, { status: 500 });
  }
}
