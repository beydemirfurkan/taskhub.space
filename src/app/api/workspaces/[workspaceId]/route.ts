import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth();
    const { workspaceId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          select: {
            id: true,
            user_id: true,
            role: true
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                user_id: true
              }
            },
            tags: {
              include: {
                tag: true
              }
            },
            _count: {
              select: {
                sub_tasks: true,
                attachments: true
              }
            }
          }
        },
        tags: true,
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth();
    const { workspaceId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin of workspace
    const member = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name },
      include: {
        members: {
          select: {
            user_id: true,
            role: true
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth();
    const { workspaceId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin of workspace
    const member = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return NextResponse.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}