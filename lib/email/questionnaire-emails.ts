/**
 * Questionnaire Email Notifications System
 * 
 * Setup Instructions:
 * 1. Install email service: npm install resend
 * 2. Add RESEND_API_KEY to .env
 * 3. Uncomment the sendEmail function below
 * 4. Use sendQuestionnaireEmail() in your APIs
 */

interface EmailData {
  to: string
  toName: string
  questionnaireTitle: string
  deadline?: string
  link: string
  adminNotes?: string
  feedback?: string
  hasCriticalFeedback?: boolean
}

/**
 * Send questionnaire-related email notifications
 * 
 * @param type - Type of notification: 'new' | 'reminder' | 'approved' | 'rejected' | 'returned' | 'late'
 * @param data - Email data containing recipient info and content
 */
export async function sendQuestionnaireEmail(
  type: 'new' | 'reminder' | 'approved' | 'rejected' | 'returned' | 'late',
  data: EmailData
) {
  try {
    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('Email service not configured. Skipping email notification.')
      return { success: false, reason: 'Email service not configured' }
    }

    const { subject, html } = getEmailTemplate(type, data)

    // Uncomment when you install resend package:
    /*
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: 'Taskara <notifications@taskara.com>', // Change to your domain
      to: data.to,
      subject,
      html,
    })

    return { success: true, data: result }
    */

    // For now, just log
    console.log('📧 Email would be sent:', {
      to: data.to,
      subject,
      type
    })

    return { success: true, reason: 'Email logged (service not configured)' }
  } catch (error) {
    console.error('Failed to send questionnaire email:', error)
    return { success: false, error }
  }
}

/**
 * Get email template based on notification type
 */
function getEmailTemplate(type: string, data: EmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  switch (type) {
    case 'new':
      return {
        subject: `New Questionnaire: ${data.questionnaireTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
                .deadline { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📋 New Questionnaire Available</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p>You have been assigned a new questionnaire:</p>
                  <h2 style="color: #6366f1; margin: 20px 0;">${data.questionnaireTitle}</h2>
                  ${data.deadline ? `
                    <div class="deadline">
                      <strong>⏰ Deadline:</strong> ${new Date(data.deadline).toLocaleString()}
                    </div>
                  ` : ''}
                  <p>Please take a moment to complete this questionnaire at your earliest convenience.</p>
                  <a href="${data.link}" class="button">Fill Questionnaire →</a>
                  <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                    This is an automated notification from Taskara. Please do not reply to this email.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'reminder':
      const hoursLeft = data.deadline ? Math.floor((new Date(data.deadline).getTime() - Date.now()) / (1000 * 60 * 60)) : 0
      return {
        subject: `⏰ Reminder: ${data.questionnaireTitle} - Due Soon!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .urgent { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⏰ Questionnaire Reminder</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <div class="urgent">
                    <h3 style="margin: 0 0 10px 0; color: #f59e0b;">Time is Running Out!</h3>
                    <p style="margin: 0; font-size: 18px;"><strong>${hoursLeft} hours</strong> left to complete</p>
                  </div>
                  <p>This is a friendly reminder that you still need to complete the following questionnaire:</p>
                  <h2 style="color: #f59e0b; margin: 20px 0;">${data.questionnaireTitle}</h2>
                  <p><strong>Deadline:</strong> ${data.deadline ? new Date(data.deadline).toLocaleString() : 'Soon'}</p>
                  <a href="${data.link}" class="button">Complete Now →</a>
                  <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                    Don't wait until the last minute! Complete it now.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'approved':
      return {
        subject: `✅ Response Approved: ${data.questionnaireTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Response Approved!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <div class="success">
                    <p style="margin: 0;"><strong>Great news!</strong> Your response has been approved.</p>
                  </div>
                  <p>Your response to the following questionnaire has been reviewed and approved:</p>
                  <h2 style="color: #10b981; margin: 20px 0;">${data.questionnaireTitle}</h2>
                  ${data.adminNotes ? `
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <strong>Admin Notes:</strong>
                      <p style="margin: 10px 0 0 0;">${data.adminNotes}</p>
                    </div>
                  ` : ''}
                  <p>Thank you for your participation!</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'rejected':
      return {
        subject: `❌ Response Rejected: ${data.questionnaireTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Response Rejected</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <div class="error">
                    <p style="margin: 0;"><strong>Your response has been rejected.</strong></p>
                  </div>
                  <p>Your response to the following questionnaire was reviewed and unfortunately rejected:</p>
                  <h2 style="color: #ef4444; margin: 20px 0;">${data.questionnaireTitle}</h2>
                  ${data.adminNotes ? `
                    <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca;">
                      <strong style="color: #ef4444;">Rejection Reason:</strong>
                      <p style="margin: 10px 0 0 0;">${data.adminNotes}</p>
                    </div>
                  ` : ''}
                  <p>Please contact the administrator if you have any questions.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'returned':
      return {
        subject: `🔄 Revision Needed: ${data.questionnaireTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .warning { background: #fed7aa; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .critical { background: #fee2e2; border: 2px solid #ef4444; padding: 15px; margin: 15px 0; border-radius: 6px; }
                .button { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔄 Response Needs Revision</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <div class="warning">
                    <p style="margin: 0;"><strong>Your response requires revision.</strong></p>
                  </div>
                  <p>Your response to the following questionnaire has been reviewed and needs some changes:</p>
                  <h2 style="color: #f97316; margin: 20px 0;">${data.questionnaireTitle}</h2>
                  ${data.hasCriticalFeedback ? `
                    <div class="critical">
                      <strong style="color: #ef4444;">🚨 Critical Feedback Provided</strong>
                      <p style="margin: 10px 0 0 0;">Some questions have critical feedback that must be addressed.</p>
                    </div>
                  ` : ''}
                  ${data.adminNotes ? `
                    <div style="background: #fff7ed; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fed7aa;">
                      <strong style="color: #f97316;">Admin Feedback:</strong>
                      <p style="margin: 10px 0 0 0;">${data.adminNotes}</p>
                    </div>
                  ` : ''}
                  <p>Please review the feedback and make the necessary changes, then resubmit your response.</p>
                  <a href="${data.link}" class="button">Review & Resubmit →</a>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'late':
      return {
        subject: `🚨 URGENT: Overdue Questionnaire - ${data.questionnaireTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .urgent { background: #fecaca; border: 3px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚨 URGENT: Overdue</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <div class="urgent">
                    <h2 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ OVERDUE</h2>
                    <p style="margin: 0; font-size: 16px;">The deadline for this questionnaire has passed!</p>
                  </div>
                  <p><strong>Questionnaire:</strong> ${data.questionnaireTitle}</p>
                  <p><strong>Deadline was:</strong> ${data.deadline ? new Date(data.deadline).toLocaleString() : 'N/A'}</p>
                  <p>This questionnaire is now overdue. Please complete it as soon as possible.</p>
                  <a href="${data.link}" class="button">Complete Now →</a>
                  <p style="margin-top: 20px; color: #dc2626; font-weight: bold;">
                    Immediate action required!
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    default:
      return {
        subject: 'Questionnaire Notification',
        html: '<p>Notification about your questionnaire.</p>'
      }
  }
}

/**
 * Batch send emails (for reminders, etc.)
 */
export async function sendBatchEmails(
  type: 'new' | 'reminder' | 'approved' | 'rejected' | 'returned' | 'late',
  recipients: EmailData[]
) {
  const results = await Promise.all(
    recipients.map(data => sendQuestionnaireEmail(type, data))
  )
  
  const successful = results.filter(r => r.success).length
  const failed = results.length - successful
  
  return {
    total: results.length,
    successful,
    failed,
    results
  }
}
