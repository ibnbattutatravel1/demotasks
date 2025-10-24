import nodemailer from 'nodemailer'

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  if (!smtpHost || !smtpUser || !smtpPass) return null
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

export async function sendUserWelcomeEmail(params: {
  to: string
  name: string
  tempPassword: string
  appUrl?: string
}) {
  const transporter = createTransporter()
  if (!transporter) return { success: false, reason: 'Email service not configured' }

  const appUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

  const subject = 'Welcome to Taskara — Your Temporary Password'
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
    <h2 style="margin:0 0 12px">Welcome, ${params.name}!</h2>
    <p style="margin:0 0 16px">Your account was created by the administrator. Use the temporary password below to sign in:</p>
    <div style="padding:12px 16px;background:#0ea5e9;color:#ffffff;border-radius:8px;display:inline-block;font-weight:700;letter-spacing:0.5px;margin-bottom:16px">
      ${params.tempPassword}
    </div>
    <p style="margin:0 0 16px">Login here:</p>
    <p style="margin:0 0 16px">
      <a href="${appUrl}/login" style="color:#2563eb;text-decoration:none">${appUrl}/login</a>
    </p>
    <p style="margin:0 0 16px">After you sign in, please open your profile settings and change your password immediately.</p>
    <p style="margin:24px 0 0;font-size:12px;color:#64748b">If you didn’t expect this message, you can ignore it.</p>
  </div>`

  const result = await transporter.sendMail({
    from: `Taskara <${fromEmail}>`,
    to: params.to,
    subject,
    html,
  })
  return { success: true, data: result }
}
