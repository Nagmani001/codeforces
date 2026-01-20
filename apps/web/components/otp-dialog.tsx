"use client"

import type React from "react"
import { toast } from "react-hot-toast";

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Loader2 } from "lucide-react"
import { authClient } from "../lib/auth";

interface OTPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onVerify: (otp: string) => void
}

export function OTPDialog({ open, onOpenChange, email, onVerify }: OTPDialogProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""])
      setError("")
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [open])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsVerifying(true)
    let actualOtp = "";
    otp.forEach(x => {
      actualOtp += x;
    });

    const { data, error } = await authClient.signIn.emailOtp({
      email: email,
      otp: actualOtp,
    });

    if (error) {
      toast.error(error.message!);
      setIsVerifying(false)
      setOtp(["", "", "", "", "", ""]);
    } else {
      toast.success("successfully signed up");
      setIsVerifying(false)
      onVerify(otpString)
    }
  }

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""])
    setError("")

    let actualOtp = "";
    otp.forEach(x => {
      actualOtp += x;
    });

    const { data, error } = await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: "sign-in",
    });

    if (!error) {
      toast.success("sent otp again , please enter the otp");
    }

    inputRefs.current[0]?.focus()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Verify Your Email</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-semibold"
              />
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleVerify} className="w-full" size="lg" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button onClick={handleResend} className="text-primary hover:underline font-medium">
              Resend
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
