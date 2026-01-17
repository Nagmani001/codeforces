"use client"

import { toast } from "sonner";
import type React from "react"
import { useState } from "react"
import { signupSchema, signupType } from "@repo/common/zodTypes";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Code2, Eye, EyeOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Label } from "@repo/ui/components/label"
import { Input } from "@repo/ui/components/input"
import { Checkbox } from "@repo/ui/components/checkbox"
import { Button } from "@repo/ui/components/button"
import { OTPDialog } from "../../../../components/otp-dialog"
import { useMutation } from "@tanstack/react-query";
import { authClient } from "../../../../lib/auth";

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})


  const mutation = useMutation({
    mutationFn: async (user: signupType) => {
      const { data, error } = await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: "nagmani",
        image: "https://avatars.githubusercontent.com/u/163531400?v=4",
      }, {
        onSuccess: async (ctx) => {
          const { data, error } = await authClient.emailOtp.sendVerificationOtp({
            email: user.email,
            type: "sign-in",
          });
          setShowOTPDialog(true)
        },
        onError: (ctx) => {
          console.log(ctx.error.message);
          toast.error("Something went wrong, please try again")
        },
      });
    },

    onError: (error: any) => {
      console.log(error);
      toast.error("error while completing the requst");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedValue = signupSchema.safeParse(formData);
    if (parsedValue.success) {
      toast.success("hi");
      mutation.mutate(formData);
    } else {
      let errors: Record<string, string> = {};
      const value = JSON.parse(parsedValue.error.message);
      value.forEach((x: any) => {
        errors[x.path[0]] = x.message
      });
      setErrors(errors);
    }
  }

  const handleOTPVerify = async (otp: string) => {
    router.push("/problems");

  }
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-foreground/10 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Code2 className="h-10 w-10 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">Codeforces</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight">
            Join the World's Largest Competitive Programming Community
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80">
            Solve algorithmic challenges, compete in rated contests, and become a better programmer.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">500K+</p>
              <p className="text-primary-foreground/70">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-primary-foreground/70">Problems</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">200+</p>
              <p className="text-primary-foreground/70">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Codeforces</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Enter your details to get started with Codeforces</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="your_handle"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OTPDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        email={formData.email}
        onVerify={handleOTPVerify}
      />
    </div>
  )
}
