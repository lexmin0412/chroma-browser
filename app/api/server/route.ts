import { NextResponse } from 'next/server';
import { getClient } from '@/app/utils/chroma';


// 检查服务器状态
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
