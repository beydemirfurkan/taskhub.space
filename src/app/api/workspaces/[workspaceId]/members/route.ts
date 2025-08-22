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

    const members = await prisma.workspace_member.findMany({
      where: {
        workspace_id: workspaceId
      },
      select: {
        id: true,
        user_id: true,
        role: true,
        assigned_tasks: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const adminMember = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userId
        }
      }
    });

    if (!adminMember || adminMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, role = 'MEMBER' } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Check if user is already a member
    const existingMember = await prisma.workspace_member.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }

    const newMember = await prisma.workspace_member.create({
      data: {
        workspace_id: workspaceId,
        user_id,
        role
      },
      select: {
        id: true,
        user_id: true,
        role: true
      }
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error adding workspace member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}