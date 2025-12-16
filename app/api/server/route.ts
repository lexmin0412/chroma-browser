import { NextResponse } from 'next/server';
import { ChromaClient } from 'chromadb';

// 创建 ChromaClient 实例
const getClient = () => {
  return new ChromaClient({
    host: process.env.CHROMA_SERVER_HOST || 'localhost',
    port: process.env.CHROMA_SERVER_PORT ? parseInt(process.env.CHROMA_SERVER_PORT) : 3003,
  });
};

// 检查服务器状态
export async function GET() {
  try {
    const client = getClient();

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
export async function DELETE() {
  try {
    const client = getClient();
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
