import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { userId } = await auth();
    const { tagId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get tag with workspace info
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                user_id: userId
              }
            }
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if user is member of workspace
    if (existingTag.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if another tag with same name already exists in workspace
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name,
        workspace_id: existingTag.workspace_id,
        id: {
          not: tagId
        }
      }
    });

    if (duplicateTag) {
      return NextResponse.json({ error: 'Tag with this name already exists' }, { status: 400 });
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        color: color || existingTag.color
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { userId } = await auth();
    const { tagId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tag with workspace info
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                user_id: userId
              }
            }
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if user is member of workspace
    if (existingTag.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.tag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}