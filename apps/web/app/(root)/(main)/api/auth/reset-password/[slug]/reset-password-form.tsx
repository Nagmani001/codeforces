"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

import { authClient } from "../../../../../../../lib/auth"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Button } from "@repo/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { BrandLogo } from "../../../../../../../components/brand-logo"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: async () => {
      const nextErrors: Record<string, string> = {}

      if (!token) nextErrors.token = "Reset link is invalid or incomplete."
      if (!formData.newPassword) nextErrors.newPassword = "Password is required."
      if (formData.newPassword && formData.newPassword.length < 8) {
        nextErrors.newPassword = "Password must be at least 8 characters."
      }
      if (!formData.confirmPassword) nextErrors.confirmPassword = "Please confirm your password."
      if (
        formData.newPassword &&
        formData.confirmPassword &&
        formData.newPassword !== formData.confirmPassword
      ) {
        nextErrors.confirmPassword = "Passwords do not match."
      }

      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) throw new Error("VALIDATION_ERROR")

      const { data, error } = await authClient.resetPassword({
        newPassword: formData.newPassword,
        token,
      })

      if (error) throw new Error(error.message || "Failed to reset password.")
      return data
    },
    onSuccess: () => {
      setIsComplete(true)
      toast.success("Password updated successfully.")
    },
    onError: (err: any) => {
      if (err?.message === "VALIDATION_ERROR") return
      toast.error(err?.message || "Something went wrong. Please try again.")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <BrandLogo className="h-10 w-10" priority />
            <span className="text-2xl font-bold text-primary-foreground">Codeforces</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight">Reset Your Password</h1>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Choose a strong password to protect your account and get back to solving problems.
          </p>
          <div className="mt-12 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
            <p className="text-primary-foreground font-medium mb-2">Tip</p>
            <p className="text-primary-foreground/80">Use 12+ characters with a mix of letters, numbers, and symbols.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Codeforces</span>
            </Link>
          </div>

          {isComplete && (
            <Alert className="mb-6 border-accent bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent">
                Password reset complete. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl">Set a new password</CardTitle>
              <CardDescription>Enter a new password for your account</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.token && <p className="text-sm text-destructive">{errors.token}</p>}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      disabled={mutation.isPending || isComplete}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={mutation.isPending || isComplete}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={mutation.isPending || isComplete}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={mutation.isPending || isComplete}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                {isComplete ? (
                  <Button type="button" className="w-full" size="lg" onClick={() => router.push("/signin")}>
                    Continue to sign in
                  </Button>
                ) : (
                  <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending || !token}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                )}
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Remembered your password? </span>
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
