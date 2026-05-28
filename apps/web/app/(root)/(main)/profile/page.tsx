import { cookies } from "next/headers"
import { Navbar } from "../../../../components/navbar"
import { getUser } from "../../../../lib/utils"
import { ProfileSettings } from "../../../../components/profile-settings"

export default async function ProfilePage() {
  const cookieStore = await cookies()

  let user = undefined
  try {
    const res = await getUser(cookieStore)
    user = res.data?.user
  } catch {
    user = undefined
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your account information and security settings.
          </p>
        </div>
        <ProfileSettings user={user} />
      </main>
    </div>
  )
}
