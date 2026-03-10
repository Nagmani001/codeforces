"use client"

import { useState } from "react"
import { Lock, User } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { authClient } from "../lib/auth"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import axios from "axios"
import { BASE_URL } from "../lib/config"
import { UploadButton } from "../lib/uploadthing"

type ProfileUser = {
  name?: string
  email?: string
  image?: string | null
}

export function ProfileSettings({ user }: { user?: ProfileUser }) {
  const [displayName, setDisplayName] = useState(user?.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const router = useRouter();
  const fallbackInitial = (user?.name?.trim()?.[0] ?? "U").toUpperCase()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your public profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
              {user?.image ? (
                <div
                  aria-label="Profile image"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.image})` }}
                />
              ) : (
                fallbackInitial
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Profile image</p>
              <div className="flex items-center gap-2">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={async (res: any) => {
                    await authClient.updateUser({
                      image: `https://2ksknbpcps.ufs.sh/f/${res[0].key}`,
                    });
                    router.refresh();
                    console.log(res);
                    toast.success("image uploadede successfully");
                  }}
                  onUploadError={(err: any) => {
                    toast.error("error uploading image");
                  }}
                />
              </div>
            </div>
          </div>

          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (user?.name != displayName) {
                await authClient.updateUser({
                  name: displayName,
                });
                toast.success("updated name successfully");
                router.refresh();
              } else {
                toast("you did not change anything");
              }
            }}
          >
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Set a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (newPassword != confirmPassword) {
                return toast.error("passwords don't match")
              }
              try {
                const value = await authClient.changePassword({
                  currentPassword,
                  newPassword,
                  revokeOtherSessions: true,
                });
                if (value.data?.token) {
                  toast.success("Password changed successfully");
                } else {
                  toast.error("incorrect current password");
                };
              } catch (err) {
              }
            }}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Update password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
