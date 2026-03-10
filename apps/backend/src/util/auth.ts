import { betterAuth } from "better-auth";
import prisma from "@repo/database/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@repo/email/mail";
import OtpTemplate from "@repo/email/template/OtpTemplate";
import ResentPasswordEmail from "@repo/email/template/resetPassword";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:3000"],
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: ResentPasswordEmail({ url, token }),
      })
    },
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 6000,
      async sendVerificationOTP({ email, otp, type }) {
        if (type == "sign-in") {
          sendEmail({
            to: email,
            react: OtpTemplate({ otp }),
            subject: "sign-in with otp"
          })
        } else if (type == "email-verification") {
          sendEmail({
            to: email,
            react: OtpTemplate({ otp }),
            subject: "email-verification Otp"
          })
        } else if (type == "forget-password") {
          console.log("forgot password")
          sendEmail({
            to: email,
            react: OtpTemplate({ otp }),
            subject: "Otp for password forgot"
          })
        }
      },
    })
  ]
});
