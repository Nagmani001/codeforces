"use client"

import { useState } from "react"
import { Camera, Lock, User } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"

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
                // TODO: Replace with your preferred image component/provider integration.
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
                <Input
                  type="file"
                  accept="image/*"
                  className="max-w-xs"
                  // TODO: handle file selection and upload.
                />
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: submit updated display name to backend.
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
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: validate fields and call password update API.
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
