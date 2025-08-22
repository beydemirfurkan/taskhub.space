import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // Check if user is member of workspace
    const member = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }

    const tags = await prisma.tag.findMany({
      where: {
        workspace_id: workspaceId
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color, workspace_id } = body;

    if (!name || !workspace_id) {
      return NextResponse.json({ error: 'Name and workspace_id are required' }, { status: 400 });
    }

    // Check if user is member of workspace
    const member = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspace_id,
          user_id: userId
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 404 });
    }

    // Check if tag with same name already exists in workspace
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        workspace_id
      }
    });

    if (existingTag) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6',
        workspace_id
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}