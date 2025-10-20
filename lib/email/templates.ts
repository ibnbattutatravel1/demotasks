// Email template builder with modern, responsive HTML design

export interface EmailTemplateData {
  userName: string
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  type: 'task' | 'project' | 'reminder' | 'approval' | 'general'
}

// Base HTML structure
function getEmailBase(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .email-body {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      color: #0f172a;
      margin: 0 0 16px 0;
      font-weight: 600;
    }
    .notification-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-task {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-project {
      background-color: #dcfce7;
      color: #15803d;
    }
    .badge-reminder {
      background-color: #fed7aa;
      color: #c2410c;
    }
    .badge-approval {
      background-color: #fce7f3;
      color: #be123c;
    }
    .badge-general {
      background-color: #e0e7ff;
      color: #4338ca;
    }
    .title {
      font-size: 22px;
      color: #0f172a;
      margin: 0 0 16px 0;
      font-weight: 700;
      line-height: 1.3;
    }
    .message {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 28px 0;
    }
    .action-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      transition: transform 0.2s;
    }
    .action-button:hover {
      transform: translateY(-1px);
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 32px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 32px 40px;
      text-align: center;
    }
    .footer-text {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 12px 0;
      line-height: 1.6;
    }
    .footer-links {
      margin: 16px 0 0 0;
    }
    .footer-link {
      color: #6366f1;
      text-decoration: none;
      font-size: 13px;
      margin: 0 12px;
    }
    .info-box {
      background-color: #f1f5f9;
      border-left: 4px solid #6366f1;
      padding: 16px 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #475569;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 20px auto;
        border-radius: 0;
      }
      .email-header, .email-body, .footer {
        padding: 24px;
      }
      .title {
        font-size: 20px;
      }
      .message {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="logo">✓ Taskara</h1>
    </div>
    ${content}
    <div class="footer">
      <p class="footer-text">
        This is an automated notification from Taskara.<br>
        You're receiving this because you have notifications enabled.
      </p>
      <div class="footer-links">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" class="footer-link">Notification Settings</a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="footer-link">Visit Dashboard</a>
      </div>
      <p class="footer-text" style="margin-top: 16px; color: #94a3b8;">
        © ${new Date().getFullYear()} Taskara. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// Get badge class based on type
function getBadgeClass(type: EmailTemplateData['type']): string {
  switch (type) {
    case 'task': return 'badge-task'
    case 'project': return 'badge-project'
    case 'reminder': return 'badge-reminder'
    case 'approval': return 'badge-approval'
    default: return 'badge-general'
  }
}

// Get badge text based on type
function getBadgeText(type: EmailTemplateData['type']): string {
  switch (type) {
    case 'task': return '📋 Task'
    case 'project': return '📁 Project'
    case 'reminder': return '⏰ Reminder'
    case 'approval': return '✓ Approval'
    default: return '🔔 Notification'
  }
}

// Main template builder
export function buildEmailTemplate(data: EmailTemplateData): string {
  const badgeClass = getBadgeClass(data.type)
  const badgeText = getBadgeText(data.type)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const actionButton = data.actionUrl && data.actionText 
    ? `
      <div style="margin: 24px 0;">
        <a href="${data.actionUrl}" class="action-button">${data.actionText}</a>
      </div>
    ` 
    : ''

  const content = `
    <div class="email-body">
      <p class="greeting">Hi ${data.userName},</p>
      
      <div class="notification-badge ${badgeClass}">
        ${badgeText}
      </div>
      
      <h2 class="title">${data.title}</h2>
      
      <p class="message">${data.message}</p>
      
      ${actionButton}
      
      ${data.actionUrl ? '' : `
        <div class="info-box">
          <p>💡 <strong>Quick Tip:</strong> You can view all your tasks and projects in your <a href="${appUrl}" style="color: #6366f1; text-decoration: none;">dashboard</a>.</p>
        </div>
      `}
    </div>
  `
  
  return getEmailBase(content)
}

// Specific notification type templates

export function taskAssignedEmail(userName: string, taskTitle: string, taskId: string, projectName?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return buildEmailTemplate({
    userName,
    title: 'New Task Assigned',
    message: `You have been assigned to the task "${taskTitle}"${projectName ? ` in the project "${projectName}"` : ''}. Please review the details and get started.`,
    actionUrl: `${appUrl}/tasks/${taskId}`,
    actionText: 'View Task',
    type: 'task'
  })
}

export function taskDueTomorrowEmail(userName: string, taskTitle: string, taskId: string, dueDate: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return buildEmailTemplate({
    userName,
    title: 'Task Due Tomorrow',
    message: `⚠️ Reminder: The task "${taskTitle}" is due on ${dueDate}. Make sure to complete it on time to stay on track.`,
    actionUrl: `${appUrl}/tasks/${taskId}`,
    actionText: 'Open Task',
    type: 'reminder'
  })
}

export function taskApprovedEmail(userName: string, taskTitle: string, taskId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return buildEmailTemplate({
    userName,
    title: 'Task Approved',
    message: `✅ Great news! Your task "${taskTitle}" has been approved. Keep up the excellent work!`,
    actionUrl: `${appUrl}/tasks/${taskId}`,
    actionText: 'View Task',
    type: 'approval'
  })
}

export function taskRejectedEmail(userName: string, taskTitle: string, taskId: string, reason?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const reasonText = reason ? `\n\nReason: ${reason}` : ''
  return buildEmailTemplate({
    userName,
    title: 'Task Requires Revision',
    message: `Your task "${taskTitle}" needs some revisions before it can be approved. Please review the feedback and make the necessary changes.${reasonText}`,
    actionUrl: `${appUrl}/tasks/${taskId}`,
    actionText: 'Review Task',
    type: 'approval'
  })
}

export function projectUpdatedEmail(userName: string, projectName: string, projectId: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return buildEmailTemplate({
    userName,
    title: 'Project Updated',
    message: `The project "${projectName}" has been updated. Check out the latest changes and stay informed about the progress.`,
    actionUrl: `${appUrl}/projects/${projectId}`,
    actionText: 'View Project',
    type: 'project'
  })
}

export function commentAddedEmail(userName: string, taskTitle: string, taskId: string, commenterName: string, comment: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const truncatedComment = comment.length > 100 ? comment.substring(0, 100) + '...' : comment
  return buildEmailTemplate({
    userName,
    title: 'New Comment',
    message: `${commenterName} commented on "${taskTitle}":\n\n"${truncatedComment}"`,
    actionUrl: `${appUrl}/tasks/${taskId}`,
    actionText: 'View Comment',
    type: 'task'
  })
}

export function genericNotificationEmail(userName: string, title: string, message: string, actionUrl?: string, actionText?: string): string {
  return buildEmailTemplate({
    userName,
    title,
    message,
    actionUrl,
    actionText,
    type: 'general'
  })
}
