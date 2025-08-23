import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının kişisel workspace'ini oluştur/bul
    let workspace = await prisma.workspace.findUnique({
      where: { id: `user_${userId}` },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          id: `user_${userId}`,
          name: 'Kişisel Çalışma Alanı',
        },
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        workspace_id: workspace.id,
        parent_id: null, // Only show parent tasks, not subtasks
      },
      include: {
        assignee: true,
        tags: {
          include: {
            tag: true,
          },
        },
        sub_tasks: {
          include: {
            assignee: true,
          },
        },
        attachments: true,
        _count: {
          select: {
            sub_tasks: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Kullanıcının kişisel workspace'ini oluştur/bul
    let workspace = await prisma.workspace.findUnique({
      where: { id: `user_${userId}` },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          id: `user_${userId}`,
          name: 'Kişisel Çalışma Alanı',
        },
      });
    }

    const body = await request.json();
    const { title, description, priority, status, assignee_id, due_date, start_date, parent_id, workspace_id } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'NONE',
        status: status || 'TODO',
        workspace_id: workspace_id || workspace.id,
        assignee_id,
        due_date: due_date ? new Date(due_date) : null,
        start_date: start_date ? new Date(start_date) : null,
        parent_id,
      },
      include: {
        assignee: true,
        tags: {
          include: {
            tag: true,
          },
        },
        sub_tasks: {
          include: {
            assignee: true,
          },
        },
        attachments: true,
        _count: {
          select: {
            sub_tasks: true,
            attachments: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}