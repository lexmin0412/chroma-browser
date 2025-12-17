import { NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

export async function GET() {
  try {
    const connections = await prisma.connection.findMany();
    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 验证必填字段
    if (!data.name || !data.type || !data.config) {
      return NextResponse.json({ error: 'Name, type and config are required' }, { status: 400 });
    }

    // 根据连接类型验证config中的特定字段
    if (data.type === 'ChromaNormal') {
      if (!data.config.host || !data.config.port) {
        return NextResponse.json({ error: 'Host and port are required in config for ChromaNormal connection' }, { status: 400 });
      }
    } else if (data.type === 'ChromaCloud') {
      if (!data.config.apiKey || !data.config.tenant || !data.config.database) {
        return NextResponse.json({ error: 'API Key, Tenant and Database are required in config for ChromaCloud connection' }, { status: 400 });
      }
    }

    const connection = await prisma.connection.create({
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        description: data.description
      }
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const data = await request.json();

    // 验证必填字段
    if (!data.name || !data.type || !data.config) {
      return NextResponse.json({ error: 'Name, type and config are required' }, { status: 400 });
    }

    // 根据连接类型验证config中的特定字段
    if (data.type === 'ChromaNormal') {
      if (!data.config.host || !data.config.port) {
        return NextResponse.json({ error: 'Host and port are required in config for ChromaNormal connection' }, { status: 400 });
      }
    } else if (data.type === 'ChromaCloud') {
      if (!data.config.apiKey || !data.config.tenant || !data.config.database) {
        return NextResponse.json({ error: 'API Key, Tenant and Database are required in config for ChromaCloud connection' }, { status: 400 });
      }
    }

    const connection = await prisma.connection.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        type: data.type,
        config: data.config,
        description: data.description
      }
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    await prisma.connection.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
