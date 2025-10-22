/**
 * Community Email Notifications
 * Beautiful HTML templates for all community events
 */

interface EmailData {
  to: string
  toName: string
  communityName: string
  link: string
  content?: string
  userName?: string
  postTitle?: string
}

export async function sendCommunityEmail(
  type: 'member_added' | 'new_post' | 'new_comment' | 'mentioned' | 'role_changed',
  data: EmailData
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Email service not configured')
      return { success: false, reason: 'Email service not configured' }
    }

    const { subject, html } = getEmailTemplate(type, data)

    // Uncomment when ready:
    /*
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'Taskara Communities <communities@taskara.com>',
      to: data.to,
      subject,
      html,
    })

    return { success: true, data: result }
    */

    console.log('📧 Community Email:', { to: data.to, subject, type })
    return { success: true, reason: 'Logged (service not configured)' }

  } catch (error) {
    console.error('Failed to send community email:', error)
    return { success: false, error }
  }
}

function getEmailTemplate(type: string, data: EmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  switch (type) {
    case 'member_added':
      return {
        subject: `Welcome to ${data.communityName}! 🏘️`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏘️ Welcome to ${data.communityName}!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p>You've been added to <strong>${data.communityName}</strong>!</p>
                  <p>This is your space to collaborate, share knowledge, and connect with your team.</p>
                  <a href="${data.link}" class="button">View Community →</a>
                  <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                    Start exploring, create posts, and engage with the community!
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Communities. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'new_post':
      return {
        subject: `New post in ${data.communityName}: ${data.postTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .post-preview { background: white; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📝 New Post in ${data.communityName}</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p><strong>${data.userName}</strong> shared a new post:</p>
                  <div class="post-preview">
                    <h3 style="margin: 0 0 10px 0; color: #1e293b;">${data.postTitle}</h3>
                    <p style="color: #475569; margin: 0;">${data.content?.substring(0, 150)}...</p>
                  </div>
                  <a href="${data.link}" class="button">Read Full Post →</a>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'new_comment':
      return {
        subject: `${data.userName} commented on your post`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .comment { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💬 New Comment</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p><strong>${data.userName}</strong> commented on your post in <strong>${data.communityName}</strong>:</p>
                  <div class="comment">
                    <p style="margin: 0; color: #475569;">${data.content}</p>
                  </div>
                  <a href="${data.link}" class="button">View Comment →</a>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'mentioned':
      return {
        subject: `@${data.userName} mentioned you in ${data.communityName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .mention { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>👋 You were mentioned!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p><strong>@${data.userName}</strong> mentioned you in <strong>${data.communityName}</strong>:</p>
                  <div class="mention">
                    <p style="margin: 0; color: #92400e;">${data.content}</p>
                  </div>
                  <a href="${data.link}" class="button">View Mention →</a>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'role_changed':
      return {
        subject: `Your role in ${data.communityName} has been updated`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .role-badge { background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
                .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎯 Role Updated</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p>Your role in <strong>${data.communityName}</strong> has been updated!</p>
                  <p style="text-align: center; margin: 30px 0;">
                    <span class="role-badge">${data.content}</span>
                  </p>
                  <p>Check out your new permissions and start contributing!</p>
                  <a href="${data.link}" class="button">Go to Community →</a>
                </div>
              </div>
            </body>
          </html>
        `
      }

    default:
      return {
        subject: 'Community Notification',
        html: '<p>Community notification</p>'
      }
  }
}
