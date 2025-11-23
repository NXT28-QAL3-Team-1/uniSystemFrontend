# 🎓 University Management System - Implementation Plan

## 📋 Project Overview

**Project Name:** جامعتي (My University)  
**Scope:** College of Computer Science Management System  
**Tech Stack:**

-   **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
-   **Backend:** Node.js + Express + TypeScript
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Features:** Bilingual (Arabic/English), Light/Dark Theme, Fully Responsive

**Important Note:**
🎯 This system is built specifically for **College of Computer Science** as a single-college implementation. While the architecture supports multiple colleges for future scalability, the current scope focuses on:

-   Computer Science Department
-   Software Engineering Specialization
-   Data Science Specialization
-   Information Systems Specialization
-   Cybersecurity Specialization

**Core Objectives:**

1. Zero logical errors - All validations at database and application level
2. Scalable architecture supporting thousands of students within CS college
3. Role-based access control with granular permissions
4. Real-time notifications and alerts
5. Comprehensive audit trail for all critical operations

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  React + TypeScript + Tailwind + shadcn/ui              │
│  - Responsive Design (Mobile/Tablet/Desktop)            │
│  - i18n (Arabic/English)                                │
│  - Theme Provider (Light/Dark)                          │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                      API LAYER                           │
│  Express + TypeScript                                    │
│  - RESTful APIs                                          │
│  - JWT Authentication                                    │
│  - Request Validation (Zod)                             │
│  - Rate Limiting                                         │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│  - Services (Domain Logic)                              │
│  - Validators (Business Rules)                          │
│  - Policy Engine (Academic Policies)                    │
│  - Notification Service                                 │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                     │
│  Prisma ORM                                             │
│  - Type-safe queries                                    │
│  - Migrations                                           │
│  - Seeding                                              │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                        │
│  PostgreSQL                                             │
│  - ACID Compliance                                      │
│  - Triggers & Constraints                               │
│  - Full-text Search                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### **Core Entities:**

```prisma
// User & Authentication
- User (id, email, password_hash, role, status, created_at, updated_at)
- Role (id, name, description, permissions[])
- Permission (id, resource, action, description)
- Session (id, user_id, token, expires_at)
- AuditLog (id, user_id, action, resource, old_value, new_value, timestamp)

// Academic Structure
- College (id, name_en, name_ar, code, description, created_at)
- Department (id, college_id, name_en, name_ar, code, head_id)
- Specialization (id, department_id, name_en, name_ar, code, min_gpa, capacity, selection_criteria)
- Curriculum (id, specialization_id, name, version, total_credits, effective_from)

// Courses & Prerequisites
- Course (id, code, name_en, name_ar, credits, type, description)
- CurriculumCourse (curriculum_id, course_id, semester, year, is_required)
- Prerequisite (course_id, prerequisite_id, type) // type: prerequisite | corequisite
- CourseCategory (id, name_en, name_ar) // Elective, Core, etc.

// Students & Enrollment
- Student (id, user_id, student_code, batch_id, specialization_id, status, admission_date)
- Batch (id, name, year, department_id, curriculum_id, max_credits, min_credits)
- Enrollment (id, student_id, section_id, status, enrolled_at, dropped_at)

// Academic Terms & Sections
- AcademicTerm (id, name, type, start_date, end_date, registration_start, registration_end)
- Section (id, course_id, term_id, code, faculty_id, capacity, schedule)
- Schedule (id, section_id, day, start_time, end_time, room)

// Grades & Attendance
- Grade (id, enrollment_id, component, score, max_score, created_by)
- GradeComponent (id, section_id, name, weight, max_score) // Quiz, Midterm, Final, etc.
- FinalGrade (id, enrollment_id, total, letter_grade, gpa_points, status, published_at)
- Attendance (id, enrollment_id, session_date, status, excuse_document)

// GPA & Academic Standing
- TermGPA (id, student_id, term_id, gpa, credits_earned, credits_attempted)
- CumulativeGPA (id, student_id, cgpa, total_credits, academic_standing, updated_at)
- AcademicStanding (id, name, min_gpa, max_gpa, description)

// Requests & Approvals
- Request (id, student_id, type, status, submitted_at, processed_at, processed_by)
- RequestType (id, name, requires_approval, approval_chain[])
- Approval (id, request_id, approver_id, status, comment, approved_at)

// Notifications
- Notification (id, user_id, title, message, type, is_read, created_at)
- NotificationTemplate (id, event, template_en, template_ar)

// Policies & Configuration
- SystemPolicy (id, key, value, description)
- GradeScale (id, min_percentage, max_percentage, letter_grade, gpa_points)
```

---

## 🚀 Implementation Phases

---

## **PHASE 1: Foundation & Authentication (Week 1-2)**

### **Goals:**

-   Set up project structure
-   Database schema with Prisma
-   Authentication system
-   Basic admin panel

### **Tasks:**

#### **1.1 Project Setup**

```bash
# Backend Setup
├── server/
│   ├── src/
│   │   ├── config/          # Database, env config
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── modules/         # Feature modules
│   │   ├── utils/           # Helpers, constants
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── package.json
│   └── tsconfig.json

# Frontend Setup
├── client/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   ├── utils/           # Helpers
│   │   ├── types/           # TypeScript types
│   │   ├── i18n/            # Translations
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
```

#### **1.2 Database Schema Implementation**

-   [ ] Create Prisma schema for all entities
-   [ ] Define relationships and constraints
-   [ ] Add database triggers for audit logs
-   [ ] Create indexes for performance
-   [ ] Add CHECK constraints for validation
-   [ ] Seed initial data (roles, permissions, policies)

**Key Constraints:**

```sql
-- Example constraints to prevent logical errors
ALTER TABLE enrollments ADD CONSTRAINT check_enrollment_dates
  CHECK (dropped_at IS NULL OR dropped_at > enrolled_at);

ALTER TABLE grades ADD CONSTRAINT check_grade_range
  CHECK (score >= 0 AND score <= max_score);

ALTER TABLE sections ADD CONSTRAINT check_capacity
  CHECK (capacity > 0);
```

#### **1.3 Authentication & Authorization**

-   [ ] JWT-based authentication
-   [ ] Password hashing (bcrypt)
-   [ ] Role-based access control (RBAC)
-   [ ] Permission-based middleware
-   [ ] Session management
-   [ ] Password reset flow

**Endpoints:**

```typescript
POST / api / auth / login;
POST / api / auth / logout;
POST / api / auth / refresh;
POST / api / auth / reset - password;
GET / api / auth / me;
PUT / api / auth / change - password;
```

#### **1.4 Basic UI Components**

-   [ ] Theme provider (light/dark)
-   [ ] i18n setup (Arabic/English)
-   [ ] Login page
-   [ ] Dashboard layout
-   [ ] Sidebar navigation
-   [ ] Header with user menu
-   [ ] shadcn/ui components integration

**Components:**

```
- Button (variants: primary, secondary, danger)
- Input (with RTL support)
- Select
- Table (with sorting, filtering)
- Modal/Dialog
- Alert/Toast
- Card
- Badge
- Loading Spinner
- Pagination
```

---

## **PHASE 2: Academic Structure Management (Week 3-4)**

### **Goals:**

-   Setup College of Computer Science structure
-   Create CS departments and specializations
-   Curriculum builder for CS programs
-   Course management with prerequisites

### **Initial Setup:**

**Single College Implementation:**

```
College of Computer Science
├── Computer Science Department
│   ├── Software Engineering Specialization
│   ├── Data Science Specialization
│   ├── Information Systems Specialization
│   └── Cybersecurity Specialization
```

### **Tasks:**

#### **2.1 College & Departments Setup**

-   [x] Create "College of Computer Science" (Fixed)
-   [x] CRUD for departments (within CS college only)
-   [ ] Assign department heads
-   [ ] Department hierarchy view

**Note:** College entity exists in DB for future scalability, but UI will be simplified since there's only one college.

**Endpoints:**

```typescript
// College endpoints exist but UI shows CS college only
GET    /api/colleges/:id  // Get CS college info

// Departments within CS college
GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
GET    /api/departments/:id/specializations
```

**UI Pages:**

```
/admin/departments
  - List view showing only CS college departments
  - Create/Edit form (college_id pre-filled with CS)
  - Assign head of department

Note: /admin/colleges removed from navigation
      CS college created via seed data
```

#### **2.2 Specializations (CS Programs)**

-   [x] CRUD for CS specializations
-   [x] Set selection criteria (min GPA, required courses)
-   [x] Set capacity limits
-   [x] Define selection timing (year/semester)

**CS Specializations:**

-   Software Engineering (CSSE)
-   Data Science (CSDS)
-   Information Systems (CSIS)
-   Cybersecurity (CSCY)

**Validation Rules:**

```typescript
// Business logic validations
- min_gpa must be between 0.0 and 4.0
- capacity must be > 0
- selection_year must be valid (2-3) for CS
- required_courses must exist in curriculum
- specialization must belong to CS department
```

**Endpoints:**

```typescript
GET    /api/specializations
POST   /api/specializations
PUT    /api/specializations/:id
DELETE /api/specializations/:id
GET    /api/specializations/:id/eligibility-criteria
```

#### **2.3 Curriculum Builder (CS Programs)**

-   [x] Create curriculum versions for CS specializations
-   [x] Add CS courses to curriculum
-   [x] Define course sequence (year/semester)
-   [x] Mark required/elective
-   [x] Set total credit requirements (132 hours for CS)
-   [ ] Curriculum preview/export

**UI Features:**

```
/admin/curricula/:id/builder
  - Drag-and-drop course organizer
  - 4-year/8-semester grid view (CS program)
  - Credit counter (target: 132 credits)
  - Prerequisite visualizer
  - Validation warnings
```

**Validations:**

```typescript
- Total credits match requirements
- Prerequisites are in earlier semesters
- No circular dependencies
- All required courses included
```

#### **2.4 Course Management (CS Courses)**

-   [x] CRUD for CS courses
-   [x] Define prerequisites/corequisites
-   [x] Course categories (Core/Elective/General)
-   [x] Course descriptions (bilingual)

**CS Course Categories:**

-   Programming Fundamentals (CS1xx)
-   Data Structures & Algorithms (CS2xx)
-   Software Engineering (CS3xx)
-   Advanced Topics (CS4xx)
-   Electives (CS5xx)

**Endpoints:**

```typescript
GET    /api/courses
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
GET    /api/courses/:id/prerequisites
POST   /api/courses/:id/prerequisites
DELETE /api/courses/:id/prerequisites/:prereqId
```

**Prerequisite Graph:**

```
- Visual representation of CS course dependencies
- Detect circular dependencies
- Show prerequisite chains
Example: CS301 requires CS201, CS201 requires CS101
```

---

## **PHASE 3: Student Management & Registration (Week 5-6)**

### **Goals:**

-   Batch management
-   Student profiles
-   Course registration system
-   Schedule conflict detection

### **Tasks:**

#### **3.1 Batch Management**

-   [ ] Create batches
-   [ ] Assign curriculum to batch
-   [ ] Set batch policies (max/min credits)
-   [ ] Bulk student import (CSV)

**Endpoints:**

```typescript
GET    /api/batches
POST   /api/batches
PUT    /api/batches/:id
DELETE /api/batches/:id
POST   /api/batches/:id/import-students
GET    /api/batches/:id/students
```

**CSV Import:**

```csv
student_code,name_en,name_ar,email,phone,national_id
20240001,John Doe,جون دو,john@example.com,+201234567890,12345678901234
```

#### **3.2 Student Profiles**

-   [ ] Student basic info
-   [ ] Academic records
-   [ ] Enrollment history
-   [ ] GPA tracking
-   [ ] Academic standing

**Student Dashboard:**

```
/dashboard
  ┌─ Academic Summary ─────────────┐
  │ CGPA: 3.45 / 4.0              │
  │ Term GPA: 3.60                 │
  │ Credits: 78/132 (59%)         │
  │ Standing: Good Standing        │
  └────────────────────────────────┘

  ┌─ Alerts ───────────────────────┐
  │ 📅 Registration opens in 3d   │
  │ ⚠️ CS301 attendance: 65%      │
  └────────────────────────────────┘
```

#### **3.3 Academic Terms & Sections**

-   [ ] Create academic terms
-   [ ] Set registration windows
-   [ ] Create course sections
-   [ ] Assign faculty & TAs
-   [ ] Define schedules

**Section Creation:**

```typescript
// Validations
- Faculty not teaching at same time
- Room not double-booked
- Section capacity > 0
- Schedule slots don't overlap
```

**Endpoints:**

```typescript
GET    /api/terms
POST   /api/terms
PUT    /api/terms/:id

GET    /api/sections
POST   /api/sections
PUT    /api/sections/:id
GET    /api/sections/:id/students
GET    /api/sections/:id/schedule
POST   /api/sections/:id/schedule
```

#### **3.4 Course Registration**

-   [ ] Registration period management
-   [ ] Available courses view
-   [ ] Prerequisite checking
-   [ ] Schedule conflict detection
-   [ ] Credit limit enforcement
-   [ ] Waitlist system

**Registration Flow:**

```
1. Check registration window
2. Get eligible courses (prerequisites met)
3. Show available sections
4. Preview schedule
5. Validate:
   - No time conflicts
   - Within credit limits
   - Prerequisites satisfied
   - Section has capacity
6. Enroll student
7. Send confirmation
```

**Endpoints:**

```typescript
GET    /api/registration/eligible-courses
POST   /api/registration/enroll
DELETE /api/registration/drop/:enrollmentId
GET    /api/registration/schedule-preview
POST   /api/registration/waitlist/:sectionId
```

**UI Features:**

```
/student/registration
  - Course search & filter
  - Prerequisite status badges
  - Section comparison table
  - Live schedule builder
  - Credit counter
  - Conflict warnings
  - Submit registration
```

---

## **PHASE 4: Grade Management & GPA Calculation (Week 7-8)**

### **Goals:**

-   Faculty grade entry
-   Grade components
-   GPA calculation engine
-   Transcript generation

### **Tasks:**

#### **4.1 Grade Components**

-   [ ] Define grading scheme per section
-   [ ] Set component weights (Quiz 10%, Midterm 30%, etc.)
-   [ ] Flexible grading structures

**Endpoints:**

```typescript
GET    /api/sections/:id/grade-components
POST   /api/sections/:id/grade-components
PUT    /api/sections/:id/grade-components/:componentId
DELETE /api/sections/:id/grade-components/:componentId
```

**Example Structure:**

```json
{
    "components": [
        { "name": "Quizzes", "weight": 10, "max_score": 100 },
        { "name": "Midterm", "weight": 30, "max_score": 100 },
        { "name": "Final", "weight": 40, "max_score": 100 },
        { "name": "Project", "weight": 20, "max_score": 100 }
    ]
}
```

#### **4.2 Grade Entry (Faculty)**

-   [ ] View enrolled students
-   [ ] Enter grades per component
-   [ ] Batch upload (Excel/CSV)
-   [ ] Grade preview before publish
-   [ ] Publish grades

**Validations:**

```typescript
- Score <= max_score
- Score >= 0
- All components entered before publish
- Cannot modify after publish (requires approval)
```

**Endpoints:**

```typescript
GET    /api/sections/:id/grades
POST   /api/grades/batch-upload
PUT    /api/grades/:id
POST   /api/grades/publish
GET    /api/grades/preview
```

**UI:**

```
/faculty/courses/:id/grades
  - Student list with photos
  - Grade entry table
  - Upload Excel button
  - Calculate totals
  - Preview modal
  - Publish confirmation
```

#### **4.3 GPA Calculation Engine**

-   [ ] Grade scale configuration
-   [ ] Term GPA calculation
-   [ ] Cumulative GPA calculation
-   [ ] Retake policy implementation
-   [ ] Academic standing determination

**Grade Scale:**

```typescript
A+  → 97-100  → 4.0
A   → 93-96   → 4.0
A-  → 90-92   → 3.7
B+  → 87-89   → 3.3
B   → 83-86   → 3.0
B-  → 80-82   → 2.7
C+  → 77-79   → 2.3
C   → 73-76   → 2.0
C-  → 70-72   → 1.7
D+  → 67-69   → 1.3
D   → 63-66   → 1.0
D-  → 60-62   → 0.7
F   → 0-59    → 0.0
```

**Calculation Logic:**

```typescript
// Term GPA
term_gpa = Σ(grade_points × credits) / Σ(credits_attempted)

// Cumulative GPA
cgpa = Σ(all_grade_points × credits) / Σ(all_credits_attempted)

// Retake Policy: Highest Grade
if (retake_exists) {
  use max(original_grade, retake_grade)
}
```

**Academic Standing:**

```typescript
CGPA ≥ 2.0  → Good Standing
1.75 ≤ CGPA < 2.0  → Academic Warning
1.5 ≤ CGPA < 1.75  → Academic Probation
CGPA < 1.5  → Academic Dismissal
```

#### **4.4 Transcript Generation**

-   [ ] Official transcript view
-   [ ] Filter by term/year
-   [ ] Show retakes
-   [ ] PDF export
-   [ ] Digital signature

**Endpoints:**

```typescript
GET    /api/students/:id/transcript
GET    /api/students/:id/transcript/pdf
GET    /api/students/:id/transcript/:termId
```

---

## **PHASE 5: Specialization Selection System (Week 9)**

### **Goals:**

-   Specialization application
-   Eligibility checking
-   Approval workflow
-   Assignment

### **Tasks:**

#### **5.1 Eligibility Checking**

-   [ ] Check GPA requirements
-   [ ] Verify prerequisite courses
-   [ ] Check capacity
-   [ ] Notify eligible students

**Eligibility Criteria:**

```typescript
interface EligibilityCheck {
    student_id: string;
    specialization_id: string;
    checks: {
        gpa_met: boolean; // CGPA >= min_gpa
        courses_completed: boolean; // Required courses done
        year_eligible: boolean; // In correct year
        capacity_available: boolean; // Seats available
    };
    eligible: boolean;
}
```

#### **5.2 Application Process**

-   [ ] Application form
-   [ ] Multiple preferences (1st, 2nd, 3rd choice)
-   [ ] Justification statement
-   [ ] Document upload

**Endpoints:**

```typescript
GET    /api/specializations/eligible
POST   /api/specializations/apply
GET    /api/specializations/application-status
PUT    /api/specializations/applications/:id
```

**UI:**

```
/student/specialization-selection
  ┌─ Available Specializations ────┐
  │ 💻 Computer Science            │
  │    Min GPA: 3.0 ✅             │
  │    Seats: 15/50                │
  │    Prerequisites: ✅           │
  │    [Select as 1st Choice]      │
  │                                 │
  │ 🤖 Artificial Intelligence     │
  │    Min GPA: 3.5 ❌             │
  │    Your GPA: 3.2               │
  └─────────────────────────────────┘
```

#### **5.3 Approval Workflow**

-   [ ] Admin reviews applications
-   [ ] Automatic assignment (by GPA ranking)
-   [ ] Manual override
-   [ ] Notify students of decision

**Assignment Algorithm:**

```typescript
1. Sort applicants by CGPA (descending)
2. For each student (highest GPA first):
   - Assign to 1st choice if seats available
   - Else try 2nd choice
   - Else try 3rd choice
   - Else mark as unassigned
3. Notify all students
```

---

## **PHASE 6: Faculty & TA Features (Week 10)**

### **Goals:**

-   Faculty dashboard
-   Course materials
-   Attendance management
-   Grade analytics

### **Tasks:**

#### **6.1 Faculty Dashboard**

-   [ ] My courses list
-   [ ] Pending tasks (grades, attendance)
-   [ ] Schedule view
-   [ ] Quick actions

**Dashboard:**

```
/faculty/dashboard
  ┌─ My Courses ────────────────────┐
  │ CS301 - Data Structures         │
  │   📊 Grades: Not Published      │
  │   📅 Next: Mon 10:00 AM         │
  │   👥 Students: 45               │
  │                                  │
  │ CS405 - Algorithms              │
  │   📊 Grades: Published          │
  │   📅 Next: Wed 2:00 PM          │
  └──────────────────────────────────┘
```

#### **6.2 Course Materials**

-   [ ] Upload lectures/PDFs
-   [ ] Organize in modules/weeks
-   [ ] Schedule publishing
-   [ ] File management

**Endpoints:**

```typescript
POST   /api/courses/:id/materials
GET    /api/courses/:id/materials
DELETE /api/courses/:id/materials/:fileId
PUT    /api/courses/:id/materials/:fileId
```

#### **6.3 Attendance Management**

-   [ ] Session creation
-   [ ] Mark attendance
-   [ ] Attendance reports
-   [ ] Low attendance alerts

**Attendance Tracking:**

```typescript
POST   /api/sections/:id/attendance/sessions
POST   /api/attendance/mark
GET    /api/sections/:id/attendance/report
GET    /api/students/:id/attendance/:courseId
```

**Alerts:**

```
⚠️ Student Ahmed Hassan: 65% attendance in CS301
  (Minimum required: 75%)
```

#### **6.4 Grade Analytics**

-   [ ] Grade distribution chart
-   [ ] Pass/fail rate
-   [ ] Average grade
-   [ ] At-risk students

**Analytics Dashboard:**

```
/faculty/courses/:id/analytics
  - Grade Distribution (Histogram)
  - Pass Rate: 87%
  - Average: 78.5%
  - Median: 80%
  - At-Risk Students (Grade < 60%)
```

---

## **PHASE 7: Request Management System (Week 11)**

### **Goals:**

-   Student requests (withdrawal, deferment, appeals)
-   Approval workflow
-   Document management
-   Status tracking

### **Tasks:**

#### **7.1 Request Types**

-   [ ] Course withdrawal
-   [ ] Study deferment
-   [ ] Grade appeal
-   [ ] Transcript request
-   [ ] Enrollment certificate

**Request Schema:**

```typescript
interface Request {
    id: string;
    student_id: string;
    type: RequestType;
    status: "pending" | "approved" | "rejected";
    details: any; // JSON with type-specific data
    attachments: string[];
    submitted_at: Date;
    processed_by?: string;
    processed_at?: Date;
    approval_chain: Approval[];
}
```

#### **7.2 Approval Workflow**

-   [ ] Define approval chains
-   [ ] Multi-level approvals
-   [ ] Email notifications
-   [ ] Approval/Rejection reasons

**Example Workflow:**

```
Course Withdrawal:
  1. Academic Advisor reviews
  2. Department Head approves
  3. Registrar executes

Grade Appeal:
  1. Course Instructor reviews
  2. Department Head decides
  3. Dean (if escalated)
```

**Endpoints:**

```typescript
POST   /api/requests
GET    /api/requests/my-requests
GET    /api/requests/pending (for approvers)
PUT    /api/requests/:id/approve
PUT    /api/requests/:id/reject
GET    /api/requests/:id/status
```

#### **7.3 Document Generation**

-   [ ] Enrollment certificate PDF
-   [ ] Transcript PDF
-   [ ] Grade report PDF
-   [ ] Digital signatures

---

## **PHASE 8: Notifications & Alerts (Week 12)**

### **Goals:**

-   Real-time notifications
-   Email notifications
-   Alert system
-   Notification preferences

### **Tasks:**

#### **8.1 Notification Service**

-   [ ] In-app notifications
-   [ ] Email notifications
-   [ ] Push notifications (future)
-   [ ] Notification templates

**Notification Types:**

```typescript
- Grade Published
- Registration Opens
- Payment Due
- Request Approved/Rejected
- Low Attendance Warning
- Academic Standing Change
- Course Material Added
- Schedule Change
```

**Endpoints:**

```typescript
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
GET    /api/notifications/unread-count
POST   /api/notifications/preferences
```

#### **8.2 Alert System**

-   [ ] Academic standing alerts
-   [ ] Attendance warnings
-   [ ] Payment reminders
-   [ ] Deadline reminders

**Alert Rules:**

```typescript
if (attendance < 75%) → Send Warning
if (CGPA < 2.0) → Academic Warning Alert
if (registration_closes_in < 3_days) → Reminder
if (payment_due_in < 7_days) → Payment Reminder
```

---

## **PHASE 9: Reports & Analytics (Week 13)**

### **Goals:**

-   Admin reports
-   Faculty reports
-   Student reports
-   Data export

### **Tasks:**

#### **9.1 Admin Reports**

-   [ ] Students at risk
-   [ ] Enrollment statistics
-   [ ] Course analytics
-   [ ] Faculty workload
-   [ ] Graduation forecast

**Reports:**

```
/admin/reports/students-at-risk
  - List of students in Warning/Probation
  - Filter by department/batch
  - Export to Excel

/admin/reports/enrollment-stats
  - Registration rate per term
  - Popular courses
  - Section fill rates

/admin/reports/graduation-forecast
  - Expected graduates this year
  - Graduation rate trends
```

#### **9.2 Faculty Reports**

-   [ ] Grade distribution
-   [ ] Attendance summary
-   [ ] Student performance

#### **9.3 Student Reports**

-   [ ] Degree audit
-   [ ] GPA trend
-   [ ] Remaining courses

**Degree Audit:**

```
/student/degree-audit
  ┌─ Completed (78 credits) ──────┐
  │ ✅ CS101 - Intro to CS (3)    │
  │ ✅ MATH101 - Calculus I (4)   │
  │ ...                            │
  └────────────────────────────────┘

  ┌─ In Progress (12 credits) ────┐
  │ 🔄 CS301 - Data Structures    │
  │ 🔄 CS305 - Databases          │
  └────────────────────────────────┘

  ┌─ Remaining (42 credits) ──────┐
  │ ⏳ CS401 - Software Eng       │
  │ ⏳ CS450 - Graduation Project │
  └────────────────────────────────┘
```

---

## **PHASE 10: Advanced Features & Polish (Week 14-15)**

### **Goals:**

-   Schedule optimization
-   What-if analysis
-   Calendar integration
-   Performance optimization

### **Tasks:**

#### **10.1 What-If Analysis**

-   [ ] GPA predictor
-   [ ] Graduation timeline
-   [ ] Course planning assistant

**UI:**

```
/student/what-if-analysis
  "What if I get B+ in all courses?"
  → Predicted Term GPA: 3.35
  → Predicted CGPA: 3.42
  → Graduation: Spring 2026 ✅
```

#### **10.2 Calendar Integration**

-   [ ] Export schedule to iCal
-   [ ] Google Calendar sync
-   [ ] Exam calendar

#### **10.3 Performance Optimization**

-   [ ] Database indexing
-   [ ] Query optimization
-   [ ] Caching (Redis)
-   [ ] Lazy loading
-   [ ] Code splitting

#### **10.4 Testing**

-   [ ] Unit tests (Jest)
-   [ ] Integration tests
-   [ ] E2E tests (Playwright)
-   [ ] Load testing

---

## 🔒 Security & Validation Checklist

### **Database Level:**

-   [x] Foreign key constraints
-   [x] CHECK constraints for data integrity
-   [x] Unique constraints
-   [x] NOT NULL constraints
-   [x] Default values
-   [x] Triggers for audit logging

### **Application Level:**

-   [x] Input validation (Zod schemas)
-   [x] SQL injection prevention (Prisma)
-   [x] XSS prevention (sanitization)
-   [x] CSRF protection
-   [x] Rate limiting
-   [x] Password strength requirements
-   [x] JWT token expiration
-   [x] Permission checks on every endpoint

### **Business Logic:**

-   [x] Prerequisite validation before enrollment
-   [x] Schedule conflict detection
-   [x] Credit limit enforcement
-   [x] Capacity limit checking
-   [x] GPA calculation verification
-   [x] Grade range validation
-   [x] Academic standing rules
-   [x] Retake policy enforcement

---

## 📁 Detailed File Structure

```
university-system/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── permission.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.validator.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── users/
│   │   │   ├── students/
│   │   │   ├── faculty/
│   │   │   ├── courses/
│   │   │   ├── enrollment/
│   │   │   ├── grades/
│   │   │   ├── specializations/
│   │   │   ├── requests/
│   │   │   ├── notifications/
│   │   │   └── reports/
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── email.ts
│   │   │   ├── pdf.ts
│   │   │   ├── upload.ts
│   │   │   └── helpers.ts
│   │   ├── types/
│   │   │   ├── express.d.ts
│   │   │   └── common.types.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/           # shadcn components
    │   │   │   ├── button.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   └── ...
    │   │   ├── layout/
    │   │   │   ├── AppLayout.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   ├── Header.tsx
    │   │   │   └── Footer.tsx
    │   │   ├── shared/
    │   │   │   ├── LoadingSpinner.tsx
    │   │   │   ├── ErrorBoundary.tsx
    │   │   │   ├── ProtectedRoute.tsx
    │   │   │   └── DataTable.tsx
    │   │   └── features/
    │   │       ├── auth/
    │   │       ├── dashboard/
    │   │       ├── registration/
    │   │       ├── grades/
    │   │       └── ...
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.tsx
    │   │   │   └── ResetPassword.tsx
    │   │   ├── student/
    │   │   │   ├── Dashboard.tsx
    │   │   │   ├── Registration.tsx
    │   │   │   ├── Grades.tsx
    │   │   │   ├── Transcript.tsx
    │   │   │   └── SpecializationSelection.tsx
    │   │   ├── faculty/
    │   │   │   ├── Dashboard.tsx
    │   │   │   ├── MyCourses.tsx
    │   │   │   ├── GradeEntry.tsx
    │   │   │   └── Attendance.tsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.tsx
    │   │   │   ├── Colleges.tsx
    │   │   │   ├── Departments.tsx
    │   │   │   ├── Specializations.tsx
    │   │   │   ├── Curricula.tsx
    │   │   │   ├── Batches.tsx
    │   │   │   └── Reports.tsx
    │   │   └── superadmin/
    │   │       ├── Dashboard.tsx
    │   │       ├── SystemPolicies.tsx
    │   │       ├── Permissions.tsx
    │   │       └── Analytics.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   ├── useTheme.ts
    │   │   ├── useLanguage.ts
    │   │   ├── useNotifications.ts
    │   │   └── useApi.ts
    │   ├── contexts/
    │   │   ├── AuthContext.tsx
    │   │   ├── ThemeContext.tsx
    │   │   └── LanguageContext.tsx
    │   ├── services/
    │   │   ├── api.ts
    │   │   ├── auth.service.ts
    │   │   ├── student.service.ts
    │   │   ├── faculty.service.ts
    │   │   └── admin.service.ts
    │   ├── utils/
    │   │   ├── validators.ts
    │   │   ├── formatters.ts
    │   │   ├── constants.ts
    │   │   └── helpers.ts
    │   ├── i18n/
    │   │   ├── en.json
    │   │   ├── ar.json
    │   │   └── i18n.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── public/
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🎨 UI/UX Guidelines

### **Design Principles:**

1. **RTL Support:** Full Arabic language support with proper RTL layout
2. **Accessibility:** WCAG 2.1 AA compliance
3. **Responsive:** Mobile-first approach
4. **Consistency:** Unified design language across all pages
5. **Performance:** Optimize for slow networks

### **Color Scheme:**

```css
/* Light Theme */
--primary: #2563eb
--secondary: #64748b
--success: #16a34a
--warning: #eab308
--danger: #dc2626
--background: #ffffff
--foreground: #0f172a

/* Dark Theme */
--primary: #3b82f6
--secondary: #94a3b8
--success: #22c55e
--warning: #fbbf24
--danger: #ef4444
--background: #0f172a
--foreground: #f1f5f9
```

### **Typography:**

-   **English:** Inter, system-ui
-   **Arabic:** Cairo, Tajawal
-   **Sizes:**
    -   Heading 1: 2.5rem
    -   Heading 2: 2rem
    -   Heading 3: 1.5rem
    -   Body: 1rem
    -   Small: 0.875rem

### **Components Standards:**

-   Use shadcn/ui as base
-   Custom variants for bilingual support
-   Consistent spacing (4px grid)
-   Smooth transitions (200ms ease-in-out)

---

## 🧪 Testing Strategy

### **Unit Tests:**

-   Service layer functions
-   Utility functions
-   GPA calculation logic
-   Validation functions

### **Integration Tests:**

-   API endpoints
-   Database operations
-   Authentication flow
-   Authorization checks

### **E2E Tests:**

-   Student registration flow
-   Grade entry and publish
-   Specialization selection
-   Request submission

### **Test Coverage Goal:** 80%+

---

## 🚀 Deployment Strategy

### **Development:**

```
- Local PostgreSQL
- Hot reload (Vite + Nodemon)
- Mock email service
```

### **Staging:**

```
- PostgreSQL (Docker)
- Environment variables
- Real email service (SendGrid)
- Logging (Winston)
```

### **Production:**

```
- Managed PostgreSQL (AWS RDS / DigitalOcean)
- PM2 for process management
- Nginx reverse proxy
- SSL/TLS certificates
- CDN for static assets
- Backup strategy (daily)
- Monitoring (Sentry)
```

---

## 📈 Success Metrics

### **Performance:**

-   Page load time < 2s
-   API response time < 500ms
-   Database query time < 100ms

### **Reliability:**

-   Uptime: 99.9%
-   Zero data loss
-   Error rate < 0.1%

### **User Satisfaction:**

-   Student satisfaction > 85%
-   Faculty adoption rate > 90%
-   Support ticket resolution < 24h

---

## 🔄 Maintenance Plan

### **Weekly:**

-   Database backup verification
-   Log review
-   Performance monitoring

### **Monthly:**

-   Security updates
-   Dependency updates
-   Performance optimization

### **Quarterly:**

-   Feature releases
-   User feedback review
-   System audit

---

## 📝 Documentation Plan

### **Technical Documentation:**

-   [ ] API documentation (Swagger/OpenAPI)
-   [ ] Database schema diagram
-   [ ] Architecture overview
-   [ ] Deployment guide
-   [ ] Development setup guide

### **User Documentation:**

-   [ ] Student user guide (AR/EN)
-   [ ] Faculty user guide (AR/EN)
-   [ ] Admin user guide (AR/EN)
-   [ ] Video tutorials
-   [ ] FAQ section

---

## 🎯 Key Decisions for AI Implementation

### **Code Generation Guidelines:**

1. **Type Safety First:** Use TypeScript strictly, no `any` types
2. **Error Handling:** Try-catch blocks with proper error messages
3. **Validation:** Zod schemas for all inputs
4. **Documentation:** JSDoc comments for all functions
5. **Naming:** Descriptive names (camelCase for JS, PascalCase for React components)
6. **DRY Principle:** Reusable functions and components
7. **Separation of Concerns:** Clear module boundaries
8. **Performance:** Optimize database queries, use indexes
9. **Security:** Never trust client input, validate everything
10. **Accessibility:** Semantic HTML, ARIA labels

### **Database Design Principles:**

1. **Normalization:** 3NF minimum
2. **Constraints:** Use DB constraints for data integrity
3. **Indexes:** On foreign keys and frequent query fields
4. **Audit Trail:** Track all critical changes
5. **Soft Deletes:** Use `deleted_at` instead of hard deletes

### **API Design Principles:**

1. **RESTful:** Standard HTTP methods
2. **Versioning:** `/api/v1/...`
3. **Pagination:** Limit/offset for lists
4. **Filtering:** Query parameters for filtering
5. **Status Codes:** Proper HTTP status codes
6. **Error Format:** Consistent error response structure

---

## ✅ Pre-Development Checklist

-   [ ] Confirm tech stack (React, Node.js, PostgreSQL, Prisma)
-   [ ] Review requirements with stakeholders
-   [ ] Set up development environment
-   [ ] Create GitHub repository
-   [ ] Set up project management tool (Jira/Trello)
-   [ ] Define coding standards
-   [ ] Set up CI/CD pipeline
-   [ ] Prepare test data
-   [ ] Design database schema
-   [ ] Create wireframes/mockups

---

## 🎊 Ready to Start!

**Next Steps:**

1. Review and approve this implementation plan
2. Set up development environment
3. Start Phase 1: Foundation & Authentication
4. Daily standups to track progress
5. Iterate and improve

**Estimated Timeline:** 15 weeks for MVP  
**Team:** AI-assisted development  
**Success:** Production-ready university management system 🚀

---

**Let's build an amazing system! 💪**
