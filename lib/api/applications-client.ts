import type { Application, ApplicationStatus } from '@/lib/types';

export async function getApplications(): Promise<Application[]> {
  const res = await fetch('/api/applications');
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json() as Promise<Application[]>;
}

export async function likeListingApi(listingId: string): Promise<Application> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  });
  if (!res.ok) throw new Error('Failed to create application');
  return res.json() as Promise<Application>;
}

export async function updateApplicationStatus(
  id: string,
  status: Extract<ApplicationStatus, 'applied' | 'rejected'>,
): Promise<Application> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update application');
  return res.json() as Promise<Application>;
}
