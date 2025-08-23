import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { title, description, priority, status, assignee_id, due_date, start_date } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.workspace_id !== `user_${userId}`) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(assignee_id !== undefined && { assignee_id }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        ...(start_date !== undefined && { start_date: start_date ? new Date(start_date) : null }),
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { title, description, priority, status, assignee_id, due_date, start_date } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.workspace_id !== `user_${userId}`) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(assignee_id !== undefined && { assignee_id }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        ...(start_date !== undefined && { start_date: start_date ? new Date(start_date) : null }),
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.workspace_id !== `user_${userId}`) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}