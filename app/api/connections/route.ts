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
    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // 根据连接类型验证特定字段
    if (data.type === 'ChromaNormal') {
      if (!data.host || !data.port) {
        return NextResponse.json({ error: 'Host and port are required for ChromaNormal connection' }, { status: 400 });
      }
    } else if (data.type === 'ChromaCloud') {
      if (!data.apiKey || !data.tenant || !data.database) {
        return NextResponse.json({ error: 'API Key, Tenant and Database are required for ChromaCloud connection' }, { status: 400 });
      }
    }

    const connection = await prisma.connection.create({
      data: {
        name: data.name,
        type: data.type,
        host: data.host,
        port: data.port,
        apiKey: data.apiKey,
        tenant: data.tenant,
        database: data.database,
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
    if (!data.name || !data.type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // 根据连接类型验证特定字段
    if (data.type === 'ChromaNormal') {
      if (!data.host || !data.port) {
        return NextResponse.json({ error: 'Host and port are required for ChromaNormal connection' }, { status: 400 });
      }
    } else if (data.type === 'ChromaCloud') {
      if (!data.apiKey || !data.tenant || !data.database) {
        return NextResponse.json({ error: 'API Key, Tenant and Database are required for ChromaCloud connection' }, { status: 400 });
      }
    }

    const connection = await prisma.connection.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        type: data.type,
        host: data.host,
        port: data.port,
        apiKey: data.apiKey,
        tenant: data.tenant,
        database: data.database,
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
