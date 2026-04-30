import { prisma } from '@/lib/prisma'
import { getProfileId } from '@/lib/session'
import { ProfileForm } from '@/components/profile/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const profileId = await getProfileId()
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: profileId },
    include: { previousLandlords: true, preferences: true },
  })
  return <ProfileForm initialProfile={JSON.parse(JSON.stringify(profile))} />
}
