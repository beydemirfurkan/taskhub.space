import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.text();
  const body = JSON.parse(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with ID ${id} and type ${eventType}`);

  try {
    switch (eventType) {
      case 'organization.created':
        await prisma.workspace.create({
          data: {
            id: evt.data.id,
            name: evt.data.name,
          },
        });
        console.log('Workspace created:', evt.data.id);
        break;

      case 'organization.updated':
        await prisma.workspace.update({
          where: { id: evt.data.id },
          data: {
            name: evt.data.name,
          },
        });
        console.log('Workspace updated:', evt.data.id);
        break;

      case 'organization.deleted':
        await prisma.workspace.delete({
          where: { id: evt.data.id },
        });
        console.log('Workspace deleted:', evt.data.id);
        break;

      case 'organizationMembership.created':
        const membership = evt.data;
        await prisma.workspace_member.upsert({
          where: {
            workspace_id_user_id: {
              workspace_id: membership.organization.id,
              user_id: membership.public_user_data?.user_id || '',
            },
          },
          update: {
            role: membership.role === 'org:admin' ? 'ADMIN' : 'MEMBER',
          },
          create: {
            workspace_id: membership.organization.id,
            user_id: membership.public_user_data?.user_id || '',
            role: membership.role === 'org:admin' ? 'ADMIN' : 'MEMBER',
          },
        });
        console.log('Membership created:', membership.id);
        break;

      case 'organizationMembership.updated':
        const updatedMembership = evt.data;
        await prisma.workspace_member.update({
          where: {
            workspace_id_user_id: {
              workspace_id: updatedMembership.organization.id,
              user_id: updatedMembership.public_user_data?.user_id || '',
            },
          },
          data: {
            role: updatedMembership.role === 'org:admin' ? 'ADMIN' : 'MEMBER',
          },
        });
        console.log('Membership updated:', updatedMembership.id);
        break;

      case 'organizationMembership.deleted':
        const deletedMembership = evt.data;
        await prisma.workspace_member.delete({
          where: {
            workspace_id_user_id: {
              workspace_id: deletedMembership.organization.id,
              user_id: deletedMembership.public_user_data?.user_id || '',
            },
          },
        });
        console.log('Membership deleted:', deletedMembership.id);
        break;

      default:
        console.log(`Unhandled webhook type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error);
    return new Response('Error processing webhook', { status: 500 });
  }

  return new Response('', { status: 200 });
}