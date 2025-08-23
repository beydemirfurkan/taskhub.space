import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attachmentId } = await params;

    // Find the attachment and verify ownership through task workspace
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check if user has access to this attachment through workspace
    if (attachment.task.workspace_id !== `user_${userId}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the file from filesystem
    try {
      const fileName = attachment.file_url.split('/').pop();
      if (fileName) {
        const filePath = join(process.cwd(), 'public', 'uploads', fileName);
        await unlink(filePath);
      }
    } catch (error) {
      // File might not exist, continue with database deletion
      console.warn('Could not delete file from filesystem:', error);
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}