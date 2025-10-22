# 📋 نظام الاستبيانات والاستمارات الشامل
# Comprehensive Questionnaires/Surveys System

## 🎯 نظرة عامة (Overview)

نظام متكامل لإرسال استبيانات واستمارات من الـ Admin لليوزرز مع:

✅ **أنواع أسئلة متعددة** - MCQ, Text, Rating, Yes/No, File Upload, Date, Multiple Choice, Checkbox  
✅ **Notifications & Deadlines** - إشعارات وتواريخ نهائية  
✅ **Approval System** - موافقة/رفض/إرجاع للتعديل  
✅ **Statistics Dashboard** - لوحة إحصائيات شاملة  
✅ **History & Audit** - سجل كامل للردود والتغييرات  
✅ **Critical Feedback** - ملاحظات مهمة باللون الأحمر  
✅ **Badge Notifications** - عدد الاستبيانات الجديدة في الـ Sidebar  

---

## 🗄️ Database Structure

### Tables:

1. **questionnaires** - الاستبيانات الأساسية
2. **questionnaire_targets** - المستخدمين المستهدفين
3. **questionnaire_questions** - الأسئلة
4. **questionnaire_responses** - ردود المستخدمين
5. **questionnaire_answers** - الإجابات على الأسئلة
6. **questionnaire_history** - السجل التاريخي
7. **questionnaire_feedback** - التعليقات والملاحظات

---

## 📝 Question Types (أنواع الأسئلة)

### 1. **MCQ (Multiple Choice - اختيار واحد)**
```typescript
{
  type: 'mcq',
  options: ['Option 1', 'Option 2', 'Option 3']
}
```

### 2. **Multiple Choice (اختيار متعدد)**
```typescript
{
  type: 'multiple_choice',
  options: ['Option A', 'Option B', 'Option C']
}
```

### 3. **Checkbox (صح/خطأ متعدد)**
```typescript
{
  type: 'checkbox',
  options: ['Item 1', 'Item 2', 'Item 3']
}
```

### 4. **Text (نص حر)**
```typescript
{
  type: 'text',
  placeholder: 'Enter your answer here...'
}
```

### 5. **Rating (تقييم)**
```typescript
{
  type: 'rating',
  minValue: 1,
  maxValue: 5
}
```

### 6. **Yes/No (نعم/لا)**
```typescript
{
  type: 'yes_no'
}
```

### 7. **File Upload (رفع ملف)**
```typescript
{
  type: 'file',
  maxFileSize: 10, // MB
  allowedFileTypes: 'pdf,doc,docx,jpg,png'
}
```

### 8. **Date (تاريخ)**
```typescript
{
  type: 'date'
}
```

---

## 🎨 User Interface

### للـ Admin:

#### 1. **Questionnaires Dashboard** (`/admin/questionnaires`)
- قائمة كل الاستبيانات
- Stats cards (Total, Published, Draft, Responses)
- Create New button
- Filter by status
- Search

#### 2. **Create Questionnaire** (`/admin/questionnaires/new`)
- معلومات أساسية (Title, Description, Instructions)
- Target audience selection
- Deadline picker
- Settings (Mandatory, Allow Late, Show Results)
- Add Questions wizard
- Preview mode

#### 3. **Question Builder**
- Drag & drop لترتيب الأسئلة
- لكل سؤال:
  - Question text
  - Type selector
  - Required toggle
  - Type-specific options
  - Help text
- Delete/Duplicate buttons

#### 4. **Responses Dashboard** (`/admin/questionnaires/[id]/responses`)
- قائمة كل الردود
- Filter by status (Pending, Submitted, Approved, Rejected, Returned)
- Completion percentage
- Late submissions indicator
- Bulk actions (Approve, Reject)
- Export to Excel/CSV

#### 5. **Response Review** (`/admin/questionnaires/[id]/responses/[responseId]`)
- عرض كل الإجابات
- Add feedback (normal/critical)
- Approve/Reject/Return buttons
- Admin notes
- History timeline
- User info

#### 6. **Statistics** (`/admin/questionnaires/[id]/stats`)
- Response rate
- Completion time average
- Question-by-question analysis
- Charts & graphs
- Export reports

---

### للـ Users:

#### 1. **My Questionnaires** (`/questionnaires`)
- قائمة الاستبيانات المطلوبة
- Badge notification في الـ Sidebar
- Filters: Pending, Submitted, All
- Deadline countdown
- Status indicators

#### 2. **Fill Questionnaire** (`/questionnaires/[id]`)
- Instructions display
- Questions واحد ورا التاني
- Progress bar
- Save as draft
- Submit button
- Validation

#### 3. **My Responses** (`/questionnaires/responses`)
- History of all responses
- Status for each
- Admin feedback display (critical في أحمر)
- Resubmit option (if returned)
- View approved responses

---

## 🔔 Notifications System

### Trigger Points:

1. **New Questionnaire Published** → All target users
2. **Deadline Approaching** → Users who haven't submitted (24 hours before)
3. **Response Approved** → User
4. **Response Rejected** → User + reason
5. **Response Returned** → User + feedback
6. **Late Submission Warning** → User (after deadline)

### Badge Counter:
- Shows في الـ Sidebar
- Count = Pending questionnaires + Returned responses
- Red background للـ urgent

---

## 🔐 Permissions

### Admin:
✅ Create questionnaires  
✅ Edit questionnaires (draft only)  
✅ Delete questionnaires  
✅ View all responses  
✅ Approve/Reject/Return responses  
✅ Add feedback  
✅ View statistics  
✅ Export data  

### Project Lead:
✅ View questionnaires sent to them  
✅ Submit responses  
✅ View their response history  
❌ Cannot create questionnaires  

### Regular User:
✅ View questionnaires sent to them  
✅ Submit responses  
✅ View their response history  
❌ Cannot create questionnaires  

---

## 📡 API Endpoints

### Admin APIs:

```
POST   /api/admin/questionnaires              # Create new
GET    /api/admin/questionnaires              # List all
GET    /api/admin/questionnaires/[id]         # Get one
PATCH  /api/admin/questionnaires/[id]         # Update
DELETE /api/admin/questionnaires/[id]         # Delete
POST   /api/admin/questionnaires/[id]/publish # Publish

GET    /api/admin/questionnaires/[id]/responses           # All responses
GET    /api/admin/questionnaires/[id]/responses/[userId]  # One response
PATCH  /api/admin/questionnaires/[id]/responses/[userId]  # Approve/Reject/Return
POST   /api/admin/questionnaires/[id]/feedback            # Add feedback

GET    /api/admin/questionnaires/[id]/stats               # Statistics
GET    /api/admin/questionnaires/[id]/export              # Export CSV
```

### User APIs:

```
GET    /api/questionnaires                    # My questionnaires
GET    /api/questionnaires/[id]               # Get questionnaire
POST   /api/questionnaires/[id]/responses     # Submit response
PATCH  /api/questionnaires/[id]/responses     # Update draft
GET    /api/questionnaires/responses          # My responses history
```

---

## 🎯 Features Highlights

### 1. **Smart Targeting**
- All Users
- Specific Users (select من قائمة)
- Role-based (User, Project Lead)

### 2. **Deadline Management**
- Visual countdown
- Automatic late marking
- Optional late submission
- Reminder notifications

### 3. **Response Workflow**
```
Pending → Draft → Submitted → Under Review → Approved/Rejected/Returned
```

### 4. **Feedback System**
- General admin notes
- Question-specific feedback
- Critical feedback (red highlight)
- Return for resubmission

### 5. **Statistics**
- Response rate %
- Average completion time
- Question-by-question breakdown
- Late submissions count
- Approval/Rejection rates

### 6. **History & Audit**
- All actions logged
- Timeline view
- Who did what and when
- Notes for each action

---

## 🎨 UI Components

### Reusable Components:

1. **QuestionBuilder** - لإنشاء الأسئلة
2. **QuestionRenderer** - لعرض السؤال للمستخدم
3. **ResponseCard** - card للرد
4. **StatCard** - إحصائية
5. **DeadlineTimer** - countdown للـ deadline
6. **FeedbackMessage** - عرض الملاحظات
7. **HistoryTimeline** - Timeline للتاريخ
8. **BadgeNotification** - الـ badge في الـ sidebar

---

## 🚀 Installation

### 1. Run SQL:
```bash
mysql -u username -p database < scripts/questionnaires-tables.sql
```

### 2. Create Upload Folder:
```bash
mkdir -p public/uploads/questionnaires
```

### 3. Done! ✅

---

## 📊 Example Workflow

### Admin Creates Questionnaire:
1. Go to `/admin/questionnaires`
2. Click "Create New"
3. Fill title, description, instructions
4. Select target users (All Users / Specific / Role-based)
5. Set deadline
6. Add questions (drag, drop, edit)
7. Preview
8. Publish → Notifications sent

### User Receives & Responds:
1. Gets notification
2. Sees badge on sidebar
3. Goes to `/questionnaires`
4. Clicks on questionnaire
5. Fills answers
6. Saves as draft (optional)
7. Submits

### Admin Reviews:
1. Goes to responses dashboard
2. Opens specific response
3. Reviews answers
4. Adds feedback (critical feedback in red)
5. Approves / Rejects / Returns
6. User gets notification

### If Returned:
1. User sees feedback (critical ones in red)
2. Edits answers
3. Resubmits
4. Admin reviews again

---

## 🎯 Best Practices

### For Admins:
✅ Write clear instructions  
✅ Use critical feedback sparingly  
✅ Set reasonable deadlines  
✅ Review responses promptly  
✅ Provide constructive feedback  

### For Users:
✅ Read instructions carefully  
✅ Answer all required questions  
✅ Submit before deadline  
✅ Check for feedback  
✅ Resubmit if returned  

---

## 🔮 Future Enhancements

- [ ] Templates للاستبيانات الشائعة
- [ ] Conditional questions (skip logic)
- [ ] Anonymous responses option
- [ ] Team collaboration على الردود
- [ ] Advanced analytics & AI insights
- [ ] Integration with projects
- [ ] Mobile app support
- [ ] Bulk import questions from Excel
- [ ] Custom branding per questionnaire

---

## 📞 Support

### Common Issues:

**Q: Can't submit response**  
A: Check all required questions are answered

**Q: Didn't receive notification**  
A: Check notification settings

**Q: Deadline passed**  
A: Contact admin if late submission is allowed

**Q: Can't see feedback**  
A: Make sure response is reviewed

---

**🎉 نظام احترافي متكامل للاستبيانات!**

Created by: Cascade AI  
Date: October 22, 2025
