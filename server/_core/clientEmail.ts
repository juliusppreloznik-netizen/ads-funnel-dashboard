import { ENV } from "./env";

export type ClientWelcomeEmailPayload = {
  clientEmail: string;
  clientName: string;
  password: string;
  portalUrl: string;
};

const buildEmailEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL("webdevtoken.v1.WebDevService/SendEmail", normalizedBase).toString();
};

/**
 * Sends a welcome email to a new client with their portal login credentials.
 * Returns `true` if the email was sent successfully, `false` otherwise.
 */
export async function sendClientWelcomeEmail(
  payload: ClientWelcomeEmailPayload
): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[ClientEmail] Email service not configured");
    return false;
  }

  const endpoint = buildEmailEndpointUrl(ENV.forgeApiUrl);

  const emailSubject = "Welcome to Catalyst - Your Client Portal Access";
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
    strong { color: #1e293b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Welcome to Catalyst!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Marketing Assets Command Center</p>
    </div>
    <div class="content">
      <p>Hi ${payload.clientName},</p>
      
      <p>Thank you for choosing Catalyst! We're excited to help you build powerful marketing assets for your business.</p>
      
      <p>Your client portal is now ready. You can track your project progress in real-time and access all your generated assets from one convenient location.</p>
      
      <div class="credentials">
        <h3 style="margin-top: 0; color: #7c3aed;">Your Login Credentials</h3>
        <p><strong>Portal URL:</strong> ${payload.portalUrl}</p>
        <p><strong>Email:</strong> ${payload.clientEmail}</p>
        <p><strong>Password:</strong> ${payload.password}</p>
      </div>
      
      <p style="text-align: center;">
        <a href="${payload.portalUrl}" class="button">Access Your Portal</a>
      </p>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Our team is reviewing your submission and will begin creating your personalized marketing assets</li>
        <li>You'll receive email notifications as we complete each task</li>
        <li>Track progress anytime through your client portal</li>
        <li>All completed assets will be available for download in your portal</li>
      </ul>
      
      <p>If you have any questions or need assistance, feel free to reach out to our team.</p>
      
      <p>Best regards,<br><strong>The Catalyst Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.clientEmail,
        subject: emailSubject,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[ClientEmail] Failed to send welcome email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[ClientEmail] Welcome email sent to ${payload.clientEmail}`);
    return true;
  } catch (error) {
    console.warn("[ClientEmail] Error sending welcome email:", error);
    return false;
  }
}
