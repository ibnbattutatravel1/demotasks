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

export async function sendPasswordResetEmail(params: {
  to: string
  name: string
  resetLink: string
}) {
  const transporter = createTransporter()
  if (!transporter) return { success: false, reason: 'Email service not configured' }

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

  const subject = 'Set your Taskara password'
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
    <h2 style="margin:0 0 12px">Welcome, ${params.name}!</h2>
    <p style="margin:0 0 12px">Your account has been created by the administrator.</p>
    <p style="margin:0 0 16px">To get started, please set your password securely using the button below. This link will expire soon for your security.</p>
    <p style="margin:16px 0">
      <a href="${params.resetLink}" style="display:inline-block;padding:12px 18px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">Set your password</a>
    </p>
    <p style="margin:0 0 16px;word-break:break-all">Or copy this link: <a href="${params.resetLink}">${params.resetLink}</a></p>
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
