import * as z from "zod"

export const AdminModel = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  otp: z.string(),
  isVerified: z.boolean(),
  otpExpiry: z.date(),
  password: z.string(),
  imageUrl: z.string().nullish(),
})
