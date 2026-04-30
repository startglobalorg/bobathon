import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { COVER_LETTER_DE } from '@/lib/cover-letter';
import type { Application, ApplicationStatus } from '@/lib/types';

function toUiApplication(a: {
  id: number;
  listingId: string;
  status: string;
  statusUpdatedAt: Date;
  generatedCoverLetter: string | null;
}): Application {
  return {
    id: String(a.id),
    listingId: a.listingId,
    status: a.status as ApplicationStatus,
    updatedAt: a.statusUpdatedAt.getTime(),
    coverLetter: a.generatedCoverLetter ?? undefined,
  };
}

export async function GET() {
  const applications = await prisma.application.findMany({
    where: { profileId: 1 },
    orderBy: { swipedAt: 'desc' },
  });
  return NextResponse.json(applications.map(toUiApplication));
}

export async function POST(req: Request) {
  const body: unknown = await req.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).listingId !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { listingId } = body as { listingId: string };

  const application = await prisma.application.upsert({
    where: { profileId_listingId: { profileId: 1, listingId } },
    create: {
      profileId: 1,
      listingId,
      status: 'pending_review',
      generatedCoverLetter: COVER_LETTER_DE,
    },
    update: {},
  });

  return NextResponse.json(toUiApplication(application), { status: 201 });
}
