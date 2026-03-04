import { Resend } from "resend";

function getClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Realtor Growth OS <noreply@example.com>",
      to,
      subject,
      text: body,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Email send failed";
    return { success: false, error: errorMessage };
  }
}
