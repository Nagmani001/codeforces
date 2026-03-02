import { CreateEmailOptions } from "resend";

export interface ResendEmailOptions
  extends Omit<CreateEmailOptions, "to" | "from"> {
  to: string;
  from?: string;
  variant?: "primary" | "notifications" | "marketing";
}

export interface NodemailerInput {
  to: string,
  subject: string,
  react: React.ReactNode,
  transporter: any
}
