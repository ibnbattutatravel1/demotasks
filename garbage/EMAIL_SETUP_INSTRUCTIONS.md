# 📧 Email Notifications Setup for Meetings

## Required Environment Variables

Add these to your `.env` file to enable email notifications:

```env
# =====================================================
# Email Configuration (Required for Meeting Notifications)
# =====================================================

# Resend API Key (Get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Email Address (must be verified in Resend)
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 How to Setup Resend (FREE)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for FREE account
3. Verify your email

### Step 2: Get API Key
1. Go to **API Keys** section
2. Click **Create API Key**
3. Copy the key (starts with `re_`)
4. Add to your `.env` file as `RESEND_API_KEY`

### Step 3: Verify Domain (Optional but Recommended)
For production:
1. Go to **Domains** section
2. Add your domain
3. Add DNS records (provided by Resend)
4. Use `noreply@yourdomain.com` as `RESEND_FROM_EMAIL`

For development/testing:
- Use `onboarding@resend.dev` (no verification needed)
- Limited to your own email address only

### Step 4: Update .env File

```env
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Restart Your Server

```bash
# Stop server (Ctrl+C)
# Delete Next.js cache
Remove-Item -Recurse -Force .next
# Restart
npm run dev
```

## 📧 Meeting Email Types

Once configured, the system will automatically send:

1. **📅 Meeting Created** - When a new meeting is scheduled
2. **📝 Meeting Updated** - When meeting details change
3. **❌ Meeting Cancelled** - When meeting is cancelled
4. **✅ Added to Meeting** - When someone is added as attendee
5. **🚫 Removed from Meeting** - When someone is removed
6. **⏰ Meeting Reminder** - X minutes before meeting starts
7. **🚀 Meeting Starting** - When meeting is about to start

## ✅ Current Status

Without configuration, you'll see:
```
Email service not configured
```

This is NORMAL and the system will still work with:
- ✅ In-app notifications
- ✅ Meeting management
- ✅ Calendar integration
- ❌ Email notifications (disabled)

## 🎯 Testing

After setup, create a test meeting:
1. Go to `/meetings`
2. Click "New Meeting"
3. Fill details and add attendees
4. Check your email inbox
5. Check attendees' email inboxes

## 🆓 Resend FREE Tier

- 3,000 emails/month FREE
- Perfect for small teams
- No credit card required
- Email API in seconds

## 🔧 Troubleshooting

### "Email service not configured"
- Check `RESEND_API_KEY` is set in `.env`
- Check `.env` file is in project root
- Restart the dev server

### Emails not arriving
- Check spam folder
- Verify sender email in Resend dashboard
- Check Resend logs for errors
- Ensure recipient email is valid

### "Domain not verified"
- For testing: use `onboarding@resend.dev`
- For production: verify your domain in Resend

## 📚 Resources

- Resend Documentation: https://resend.com/docs
- Resend API Keys: https://resend.com/api-keys
- Resend Domains: https://resend.com/domains

---

**Note:** Email notifications are optional. The meeting system works perfectly without them using in-app notifications only!
