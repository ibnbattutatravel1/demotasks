# 📋 نظام الاستبيانات الشامل - الدليل الكامل
# Complete Questionnaires System Guide

## 🎯 ملخص النظام (System Overview)

نظام متكامل لإنشاء وإدارة الاستبيانات والاستمارات من الـ Admin لليوزرز مع:

### ✅ الميزات الأساسية (Core Features):
1. **8 أنواع أسئلة** - MCQ, Text, Rating, Yes/No, File, Date, Multiple Choice, Checkbox
2. **Smart Targeting** - All Users / Specific Users / Role-based
3. **Deadline Management** - مع countdown وإشعارات
4. **Approval Workflow** - Pending → Submitted → Approved/Rejected/Returned
5. **Critical Feedback** - ملاحظات مهمة باللون الأحمر
6. **History & Audit** - تتبع كل التغييرات
7. **Email Notifications** - إشعارات بالإيميل ✨ NEW
8. **Reminder System** - تذكير قبل الـ deadline ✨ NEW
9. **Statistics Dashboard** - إحصائيات متقدمة ✨ NEW
10. **Response Review** - مراجعة تفصيلية ✨ NEW

---

## 📧 Email Notifications System

### Types of Email Notifications:

#### 1. **New Questionnaire Published**
```
To: All target users
Subject: New Questionnaire: [Title]
Content:
- Questionnaire title & description
- Deadline
- Is Mandatory flag
- Link to fill
```

#### 2. **Reminder Before Deadline (24h)**
```
To: Users who haven't submitted
Subject: Reminder: [Title] - Due Tomorrow
Content:
- Time remaining
- Importance level
- Quick link to submit
```

#### 3. **Response Approved**
```
To: User
Subject: Your Response Was Approved - [Title]
Content:
- Approval confirmation
- Date approved
- Admin notes (if any)
```

#### 4. **Response Rejected**
```
To: User
Subject: Response Needs Revision - [Title]
Content:
- Rejection reason
- Admin feedback
- What needs to be fixed
```

#### 5. **Response Returned for Resubmission**
```
To: User
Subject: Please Revise Your Response - [Title]
Content:
- Critical feedback highlighted
- Specific questions needing revision
- Link to edit and resubmit
```

#### 6. **Late Submission Warning**
```
To: User
Subject: URGENT: Overdue Questionnaire - [Title]
Content:
- Days overdue
- Consequences (if any)
- Extension request option
```

### Email Configuration:

```typescript
// lib/email/questionnaire-emails.ts
export const sendQuestionnaireEmail = async (
  to: string,
  type: 'new' | 'reminder' | 'approved' | 'rejected' | 'returned' | 'late',
  data: {
    questionnaireTitle: string
    deadline: string
    link: string
    feedback?: string
    critical?: boolean
  }
) => {
  // Send email using your email service (SendGrid, Resend, etc.)
}
```

---

## ⏰ Reminder System

### Automatic Reminders:

#### 1. **24 Hours Before Deadline**
- Checks every hour
- Sends to users with status = 'pending'
- Only for mandatory questionnaires

#### 2. **12 Hours Before Deadline**
- Second reminder
- More urgent tone

#### 3. **1 Hour Before Deadline**
- Final urgent reminder
- Red alert style

#### 4. **After Deadline (Late)**
- Daily reminders for X days
- Option to disable after N days

### Cron Job Setup:

```typescript
// app/api/cron/questionnaire-reminders/route.ts
export async function GET() {
  // Find questionnaires with deadline in next 24h
  // Find users who haven't submitted
  // Send reminder emails
  // Create in-app notifications
  // Log reminder sent
}
```

### Deployment Options:

#### Option 1: Vercel Cron Jobs
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/questionnaire-reminders",
    "schedule": "0 * * * *"  // Every hour
  }]
}
```

#### Option 2: External Cron Service
- Use cron-job.org
- Point to: https://your-domain.com/api/cron/questionnaire-reminders
- Set schedule: Every hour

---

## 📊 Statistics Dashboard

### Admin Analytics Page: `/admin/questionnaires/[id]/stats`

#### 1. **Overview Cards**
- Total Responses
- Response Rate %
- Average Completion Time
- On-time vs Late Submissions

#### 2. **Status Breakdown**
- Pending count
- Submitted count
- Approved count
- Rejected count
- Returned count

#### 3. **Question-by-Question Analysis**

For MCQ/Multiple Choice:
- Bar chart showing answer distribution
- Most selected option
- Least selected option

For Rating:
- Average rating
- Rating distribution histogram

For Yes/No:
- Pie chart
- Percentage breakdown

For Text:
- Word cloud (optional)
- Length statistics
- Sample responses

#### 4. **Time Analysis**
- Response timeline (когда تم الرد)
- Average time to complete
- Peak response times

#### 5. **User Engagement**
- Who responded quickly
- Who is late
- Who needs follow-up

#### 6. **Export Options**
- Export all responses to Excel
- Export statistics report (PDF)
- Export individual question data (CSV)

### Charts & Visualizations:

Using **Recharts** or **Chart.js**:

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={questionData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="option" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" fill="#6366f1" />
  </BarChart>
</ResponsiveContainer>
```

---

## 🔍 Response Review Page

### Admin Review Interface: `/admin/questionnaires/[id]/responses/[userId]`

#### Layout:

```
┌──────────────────────────────────────────────┐
│ User Info & Status                            │
│ ┌──────────┐  Name: Ahmed Hassan            │
│ │  Avatar  │  Submitted: Oct 22, 2025       │
│ └──────────┘  Status: Submitted              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Questions & Answers                           │
│                                               │
│ Q1. What is your role?                       │
│ A: Software Engineer                          │
│ [Add Feedback] [Mark as Critical]            │
│                                               │
│ Q2. Rate your experience (1-5)               │
│ A: ⭐⭐⭐⭐⭐ (5)                              │
│                                               │
│ Q3. Upload your CV                           │
│ A: 📄 cv_ahmed.pdf (Download)                │
│                                               │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ Admin Actions                                 │
│ ┌─────────────────────────────────┐          │
│ │ Admin Notes (Optional)          │          │
│ │ [Textarea for notes]            │          │
│ └─────────────────────────────────┘          │
│                                               │
│ [✓ Approve] [✗ Reject] [↩ Return]          │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ History Timeline                              │
│ ● Oct 22, 10:00 AM - Response submitted     │
│ ● Oct 22, 10:30 AM - Admin viewed           │
│ ● Oct 22, 11:00 AM - Feedback added         │
└──────────────────────────────────────────────┘
```

#### Features:

1. **Question-by-Question Review**
   - See each question with user's answer
   - Add feedback per question
   - Mark feedback as critical (red flag)

2. **File Previews**
   - View uploaded files inline
   - Download option
   - File type validation

3. **Comparison View** (if applicable)
   - Compare with other responses
   - See outliers

4. **Bulk Actions**
   - Approve multiple responses at once
   - Reject with same reason
   - Return to multiple users

5. **Comments Thread**
   - Admin can add multiple comments
   - User can reply (if returned)
   - Track conversation history

---

## 🗂️ المكونات الجديدة (New Components)

### 1. Email Templates Component

```typescript
// components/email-templates/questionnaire-notification.tsx
export function QuestionnaireEmailTemplate({
  type,
  questionnaireTitle,
  deadline,
  link,
  feedback,
}: QuestionnaireEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        {/* Professional email template */}
      </Body>
    </Html>
  )
}
```

### 2. Statistics Charts Component

```typescript
// components/questionnaire-stats.tsx
export function QuestionnaireStats({ questionnaireId }: { questionnaireId: string }) {
  return (
    <div>
      <OverviewCards />
      <StatusBreakdown />
      <QuestionAnalysis />
      <TimelineChart />
      <ExportButtons />
    </div>
  )
}
```

### 3. Response Review Component

```typescript
// components/response-review.tsx
export function ResponseReview({ responseId }: { responseId: string }) {
  return (
    <div>
      <UserHeader />
      <QuestionsAnswers />
      <FeedbackSection />
      <AdminActions />
      <HistoryTimeline />
    </div>
  )
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Email Notifications ✨
1. Set up email service (SendGrid/Resend)
2. Create email templates
3. Add email triggers to APIs
4. Test email delivery

### Phase 2: Reminder System ⏰
1. Create cron job API
2. Implement reminder logic
3. Set up cron scheduler
4. Test reminders

### Phase 3: Statistics Dashboard 📊
1. Create stats calculation functions
2. Build chart components
3. Create stats page
4. Add export functionality

### Phase 4: Response Review 🔍
1. Create review page layout
2. Implement feedback system
3. Add bulk actions
4. Create history timeline

---

## 📦 Required Packages

```bash
# For Email
npm install @react-email/components resend

# For Charts
npm install recharts

# For Excel Export
npm install xlsx

# For PDF Generation
npm install jspdf

# For Date Handling
npm install date-fns
```

---

## 🎯 الخطوات التالية (Next Steps)

1. ✅ نفذ الـ SQL (done)
2. ✅ أضف الـ tab في الـ sidebar (done)
3. 🔄 أعمل الميزات الأربعة الجديدة:
   - Email Notifications
   - Reminder System
   - Statistics Dashboard
   - Response Review Page

---

**🔥 جاهز لبدء التنفيذ!**
