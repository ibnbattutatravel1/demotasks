# Email Notification System

This directory contains the email template system for Taskara notifications.

## Features

✨ **Modern HTML Templates** - Beautiful, responsive email designs
📱 **Mobile-Friendly** - Optimized for all screen sizes
🎨 **Branded Design** - Consistent with Taskara's visual identity
🔗 **Action Buttons** - Direct links to relevant tasks/projects
📧 **Text Fallback** - Plain text version for email clients that don't support HTML

## Email Templates

### Available Templates

1. **Task Assigned** - When a user is assigned to a task
2. **Task Due Tomorrow** - Reminder for tasks due the next day
3. **Task Approved** - Confirmation when a task is approved
4. **Task Rejected** - Notification when a task needs revision
5. **Project Updated** - Alert when project details change
6. **Comment Added** - Notification for new comments
7. **Generic Notification** - Fallback for other notification types

## Usage

### Basic Notification

```typescript
import { notifyUser } from '@/lib/notifications'

await notifyUser({
  userId: 'user-id',
  type: 'task_assigned',
  title: 'New Task Assigned',
  message: 'You have been assigned to a new task.',
  relatedId: 'task-id',
  relatedType: 'task',
  topic: 'taskReminders',
  metadata: {
    taskTitle: 'Complete the documentation',
    projectName: 'Q4 Project'
  }
})
```

### With Full Metadata

```typescript
await notifyUser({
  userId: assigneeId,
  type: 'task_assigned',
  title: `New Task: ${taskTitle}`,
  message: `You have been assigned to "${taskTitle}"`,
  relatedId: taskId,
  relatedType: 'task',
  topic: 'taskReminders',
  metadata: {
    taskTitle: taskTitle,
    projectName: projectName,
    dueDate: '2025-10-25',
  }
})
```

### Comment Notification

```typescript
await notifyUser({
  userId: taskOwnerId,
  type: 'comment_added',
  title: 'New Comment',
  message: 'Someone commented on your task',
  relatedId: taskId,
  relatedType: 'task',
  metadata: {
    taskTitle: 'Fix the bug',
    commenterName: 'John Doe',
    comment: 'I think we should approach this differently...'
  }
})
```

### Project Update

```typescript
await notifyUser({
  userId: teamMemberId,
  type: 'project_updated',
  title: 'Project Updated',
  message: 'The project details have been updated',
  relatedId: projectId,
  relatedType: 'project',
  topic: 'projectUpdates',
  metadata: {
    projectName: 'Website Redesign'
  }
})
```

## Environment Configuration

Add these variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Taskara <noreply@taskara.com>"

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Gmail Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password as `SMTP_PASS`

### Other SMTP Providers

- **SendGrid**: SMTP_HOST=smtp.sendgrid.net, SMTP_PORT=587
- **Mailgun**: SMTP_HOST=smtp.mailgun.org, SMTP_PORT=587
- **Amazon SES**: SMTP_HOST=email-smtp.region.amazonaws.com, SMTP_PORT=587

## Metadata Fields

### Task Notifications
- `taskTitle` - The title of the task
- `projectName` - Name of the project (optional)
- `dueDate` - Due date in readable format
- `reason` - Rejection reason (for task_rejected)

### Comment Notifications
- `taskTitle` - The task being commented on
- `commenterName` - Name of the person who commented
- `comment` - The comment text

### Project Notifications
- `projectName` - Name of the project

## Customization

### Modify Templates

Edit `lib/email/templates.ts` to customize the email design:

```typescript
// Change colors
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);

// Update logo
<h1 class="logo">Your Logo</h1>

// Modify button styles
.action-button {
  background: #YOUR_BRAND_COLOR;
}
```

### Add New Template

```typescript
export function customNotificationEmail(
  userName: string,
  customData: string,
  relatedId: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return buildEmailTemplate({
    userName,
    title: 'Custom Title',
    message: customData,
    actionUrl: `${appUrl}/custom/${relatedId}`,
    actionText: 'View Custom',
    type: 'general'
  })
}
```

Then add the case in `lib/notifications.ts`:

```typescript
case 'custom_type':
  subject = `Custom: ${metadata?.customField || title}`
  htmlContent = emailTemplates.customNotificationEmail(
    user.name,
    metadata?.customData || message,
    relatedId || ''
  )
  break
```

## Testing

### Test Email Locally

```typescript
// In a test file or API route
import { notifyUser } from '@/lib/notifications'

export async function GET() {
  await notifyUser({
    userId: 'your-user-id',
    type: 'task_assigned',
    title: 'Test Email',
    message: 'This is a test notification',
    relatedId: 'test-task-id',
    relatedType: 'task',
    metadata: {
      taskTitle: 'Test Task',
      projectName: 'Test Project'
    }
  })
  
  return Response.json({ success: true })
}
```

### Preview in Browser

Open the generated HTML in a browser to see how it looks:

```typescript
import { taskAssignedEmail } from '@/lib/email/templates'

const html = taskAssignedEmail('John Doe', 'Complete Documentation', 'task-123', 'Q4 Project')
// Save to file or render in browser
```

## Troubleshooting

### Emails Not Sending

1. Check SMTP configuration in `.env`
2. Verify `nodemailer` is installed: `npm install nodemailer`
3. Check console logs for detailed error messages
4. Ensure user has email address in database
5. Check spam folder

### Template Not Rendering

1. Verify notification type matches case in `sendEmailWithTemplate`
2. Check metadata fields are being passed correctly
3. Look for TypeScript errors in template files

### Links Not Working

1. Set `NEXT_PUBLIC_APP_URL` in environment variables
2. Ensure it includes protocol (https://)
3. Don't include trailing slash

## Email Examples

### Sent Emails Will Look Like:

- **Header**: Purple gradient with "✓ Taskara" logo
- **Badge**: Color-coded notification type badge
- **Title**: Clear, prominent heading
- **Message**: Readable body text with good spacing
- **Action Button**: Purple gradient call-to-action
- **Footer**: Settings links and copyright

## Best Practices

1. **Always include metadata** for better email content
2. **Use descriptive titles** that appear in email subject
3. **Keep messages concise** but informative
4. **Test emails** before deploying to production
5. **Monitor bounce rates** and adjust SMTP settings if needed

## Security Notes

⚠️ **Never commit SMTP credentials** to version control
🔒 **Use app-specific passwords** for Gmail
🛡️ **Enable TLS/SSL** for production SMTP
📧 **Validate email addresses** before sending
