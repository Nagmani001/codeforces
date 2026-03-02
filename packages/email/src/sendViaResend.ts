import { Resend } from "resend";
import { ResendEmailOptions } from "./resend/types";

export default async function sendEmailViaResend(resend: Resend, options: ResendEmailOptions) {

  if (options.react) {
    const { data, error } = await resend.emails.send({
      from: 'Nagmani <nagmani@email.nagmaniupadhyay.com.np>',
      to: options.to,
      subject: options.subject!,
      react: options.react,
    });
  } else if (options.html) {
    const { data, error } = await resend.emails.send({
      from: 'Nagmani <nagmani@email.nagmaniupadhyay.com.np>',
      to: options.to,
      subject: options.subject!,
      react: options.react,
    });
  }
}
