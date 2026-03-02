import { Resend } from "resend";
import sendEmailViaResend from './sendViaResend';
import sendEmailViaNodemailer from './sendViaNodemailer';
import { ResendEmailOptions } from './resend/types';
import { createTransport, Transporter } from "nodemailer";

export interface EmailConfig {
  resendApiKey?: string;
  smtp?: {
    host: string;
    port: number;
    user?: string;
    password?: string;
  };
}

let resend: Resend | null = null;
let smtpConfig: EmailConfig["smtp"] | null = null;
let transporter: Transporter | null = null;

export function initEmail(config: EmailConfig) {
  if (config.resendApiKey) {
    resend = new Resend(config.resendApiKey);
  }
  if (config.smtp) {
    smtpConfig = config.smtp;
    transporter = createTransport({
      host: smtpConfig?.host,
      port: smtpConfig?.port,
      auth: {
        user: smtpConfig?.user,
        pass: smtpConfig?.password
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
}

export async function sendEmail(options: ResendEmailOptions) {

  if (resend) {
    return await sendEmailViaResend(resend, options);
  }


  if (smtpConfig) {


    return await sendEmailViaNodemailer({
      to: options.to,
      subject: options.subject!,
      react: options.react,
      transporter
    });
  }
  console.log("errow seding email , neither smpt nor resend is configured");
}

/*
INFO: don't really need this 
export async function sendBatchEmail(options: amy) {
}
*/
