import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applicationStatusSchema } from '@/lib/validation/profile';
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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body: unknown = await req.json();
  const parsed = applicationStatusSchema.safeParse(
    (body as Record<string, unknown>)?.status,
  );
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id: Number(params.id) },
    data: { status: parsed.data, statusUpdatedAt: new Date() },
  });

  return NextResponse.json(toUiApplication(application));
}
