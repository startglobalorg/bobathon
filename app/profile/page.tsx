import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: 1 },
    include: { previousLandlords: true, preferences: true },
  })
  return <ProfileForm initialProfile={JSON.parse(JSON.stringify(profile))} />
}
