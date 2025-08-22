import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            user_id: userId
          }
        }
      },
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

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
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
    const { name, organizationId } = body;

    if (!name || !organizationId) {
      return NextResponse.json({ error: 'Name and organizationId are required' }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        id: organizationId,
        name,
        members: {
          create: {
            user_id: userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true,
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}