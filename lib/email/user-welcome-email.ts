import nodemailer from "nodemailer"

interface WelcomeEmailOptions {
  to: string
  name: string
  tempPassword: string
  appUrl?: string
  changePasswordUrl?: string
}

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || "587")
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
}

export async function sendUserWelcomeEmail(options: WelcomeEmailOptions) {
  const transporter = createTransporter()

  if (!transporter) {
    console.warn("Email service not configured - missing SMTP credentials")
    return { success: false, reason: "Email service not configured" }
  }

  const appUrl = options.appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const passwordUrl = options.changePasswordUrl || `${appUrl}/settings`
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

  const subject = "Welcome to Taskara - Your Account Details"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Welcome to Taskara, ${options.name}!</h2>
      <p>You've been added to the Taskara platform. Use the temporary credentials below to sign in:</p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${options.to}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> ${options.tempPassword}</p>
      </div>
      <p>Next steps:</p>
      <ol>
        <li>Sign in at <a href="${appUrl}" style="color: #2563eb;">${appUrl}</a></li>
        <li>Go to <a href="${passwordUrl}" style="color: #2563eb;">your account settings</a></li>
        <li>Update your password immediately to keep your account secure</li>
      </ol>
      <p>If you didn't expect this email, please contact your administrator.</p>
      <p style="margin-top: 32px; color: #64748b;">– The Taskara Team</p>
    </div>
  `

  const text = `Welcome to Taskara, ${options.name}!

You've been added to the Taskara platform. Use the temporary credentials below to sign in.

Email: ${options.to}
Temporary password: ${options.tempPassword}

Next steps:
1. Sign in at ${appUrl}
2. Go to your account settings (${passwordUrl})
3. Update your password immediately to keep your account secure

If you didn't expect this email, please contact your administrator.

– The Taskara Team
`

  try {
    const result = await transporter.sendMail({
      from: `Taskara Onboarding <${fromEmail}>`,
      to: options.to,
      subject,
      html,
      text,
    })

    console.log("✅ Welcome email sent:", { to: options.to, messageId: result.messageId })
    return { success: true, data: result }
  } catch (error: any) {
    console.error("❌ Failed to send welcome email:", error)
    return { success: false, error: error.message }
  }
}
