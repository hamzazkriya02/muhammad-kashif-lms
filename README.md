# 🎓 Muhammad Kashif LMS

A modern, secure, and responsive Learning Management System built with **Next.js, TypeScript, Prisma, and PostgreSQL**.

Muhammad Kashif LMS provides separate **Admin** and **Student** portals for managing students, courses, modules, video lessons, access control, learning progress, and account security.

The project is designed with a clean premium dashboard, secure authentication, responsive layouts, and a scalable backend architecture.

---

## ✨ Features

### 👨‍💼 Admin Portal

The Admin Portal provides complete control over the LMS.

- Premium Admin Dashboard
- Student Management
- Create Students
- Enable / Disable Student Accounts
- Delete Students
- Reset / Set Student Password
- Course Management
- Create / Edit / Delete Courses
- Course Studio
- Create Course Modules / Sections
- Add Video Lessons
- Edit / Delete Lessons
- Assign Courses to Students
- Remove Course Access
- Student Progress Monitoring
- Recent Student Activity
- LMS Analytics
- Admin Settings
- Change Admin Password
- Secure Logout

---

## 👨‍🎓 Student Portal

Students receive a clean and focused learning environment.

- Secure Student Login
- Premium Student Dashboard
- View Assigned Courses
- Access Course Modules
- Watch Video Lessons
- Mark Lessons as Completed
- Course Progress Tracking
- Continue Learning
- Previous / Next Lesson Navigation
- Completed Lesson Tracking
- Account Security
- Change Password
- Secure Logout
- Responsive Mobile Interface

---

## 📊 Admin Dashboard

The premium Admin Dashboard includes useful LMS statistics such as:

- Total Students
- Active Students
- Total Courses
- Course Modules
- Video Lessons
- Lesson Completions
- Student Learning Activity
- Course Progress Analytics
- Recent Students
- Quick Actions

The dashboard is designed with a modern:

- Dark premium sidebar
- Light dashboard workspace
- Responsive cards
- Charts
- Tables
- Clean typography
- Professional navigation

---

## 🎬 Video Lesson Support

Administrators can add video lessons directly inside the Course Studio.

Supported YouTube formats include:

```text
https://youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://youtube.com/shorts/VIDEO_ID
```

The system extracts and stores the required video information for lesson playback.

---

# 🔐 Security Features

Security is an important part of this LMS.

## Password Hashing

Passwords are never stored as plain text.

The application uses:

```text
bcrypt
```

with secure password hashing before saving credentials to the database.

---

## Strong Password Policy

Passwords must follow a stronger security policy.

Requirements include:

- Minimum password length
- Uppercase character
- Lowercase character
- Number

This helps protect accounts against weak password attacks.

---

## Secure Authentication

Authentication uses secure server-side session handling.

The application:

1. Generates a secure random session token.
2. Sends the token to the authenticated browser.
3. Stores only the hashed version of the token in the database.

This helps reduce the impact of database/session leakage.

---

## Secure Cookies

Authentication cookies use security options such as:

```text
HttpOnly
Secure
SameSite
Expiration
Priority
```

This helps protect session cookies from common browser-based attacks.

---

## Login Rate Limiting

Repeated login attempts are limited.

This provides protection against:

- Brute-force attacks
- Password guessing
- Automated repeated login attempts

---

## Login History

Login activity can be stored in the database.

Information may include:

- User
- IP Address
- Browser / User Agent
- Login Status
- Successful Login
- Failed Login
- Date & Time

---

## Security Alerts

Repeated suspicious login attempts can create security alerts in the database.

Example:

```text
REPEATED_LOGIN_FAILURES
```

This provides a foundation for future security monitoring tools.

---

## Role-Based Access Control

Admin and Student access is protected on the server.

Students cannot access Admin pages simply by manually entering an Admin URL.

Example:

```text
/admin/dashboard
/admin/users
/admin/courses
```

Admin APIs also verify the authenticated user's role.

---

## Student Course Authorization

Students can only update progress for lessons belonging to courses they are authorized to access.

The server validates:

```text
Student
   ↓
Course Access
   ↓
Course
   ↓
Section / Module
   ↓
Lesson
```

This prevents unauthorized progress manipulation.

---

## Account Status Protection

Student accounts can be:

```text
ACTIVE
DISABLED
```

When an account is disabled, protected LMS access is denied.

---

## Session Revocation

Old sessions can be revoked after:

- Password changes
- Password resets
- New authentication sessions
- Account security changes

This improves protection if an old session becomes compromised.

---

## Protected Password Data

Password hashes are never intentionally exposed to the frontend.

Admin APIs only return required user information such as:

```text
ID
Name
Email
Status
Role
hasPassword
```

Sensitive password hashes remain server-side.

---

## Input Validation

API inputs are validated before database operations.

Validation includes:

- Email validation
- Password validation
- Required fields
- String length limits
- IDs
- Course information
- Lesson information
- Video URLs

---

## Security Headers

The application includes browser security headers such as:

```text
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

These provide additional protection against:

- Clickjacking
- Unsafe resource loading
- Content type sniffing
- Unnecessary browser permissions
- HTTP downgrade attacks

---

## PostgreSQL SSL

For production PostgreSQL connections, SSL verification can be enabled using:

```env
sslmode=verify-full
```

This provides stronger TLS verification for the connection between the application and PostgreSQL database.

---

# 🛠️ Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide Icons
- Responsive UI

### Backend

- Next.js Server Components
- Next.js Route Handlers
- Server-side Authentication
- Prisma ORM

### Database

- PostgreSQL
- Neon PostgreSQL compatible

### Security

- bcrypt
- Secure Session Tokens
- SHA-256 Session Hashing
- Secure HTTP Cookies
- Role-Based Authorization
- Login Rate Limiting
- Security Headers

---

# 📁 Project Structure

```text
muhammad-kashif-lms/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── courses/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   └── change-password/
│   │   │
│   │   ├── student/
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   └── change-password/
│   │   │
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── student/
│   │   │
│   │   └── login/
│   │
│   ├── components/
│   │   ├── admin/
│   │   └── student/
│   │
│   └── lib/
│
├── .env
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/hamzazkriya02/muhammad-kashif-lms.git
```

Move into the project:

```bash
cd muhammad-kashif-lms
```

---

## 2. Install Dependencies

```bash
npm install
```

Prisma Client will automatically be generated during installation.

---

# 🔑 Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL="YOUR_POSTGRESQL_DATABASE_URL"

ADMIN_EMAIL="YOUR_ADMIN_EMAIL"
ADMIN_PASSWORD="YOUR_STRONG_ADMIN_PASSWORD"
```

### Important

Never upload your `.env` file to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
.env.local
.env*
```

---

# 🗄️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Push the Prisma schema to your database:

```bash
npm run db:push
```

or:

```bash
npx prisma db push
```

---

# 👨‍💼 Create Initial Admin

After setting:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

run:

```bash
npm run db:seed
```

The seed process creates the initial Admin account.

For security, default Admin credentials are not used.

---

# ▶️ Development Server

Start the LMS:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Before deployment, run:

```bash
npm run typecheck
```

Then:

```bash
npm run lint
```

Then:

```bash
npm run build
```

If everything passes successfully, the project is ready for production deployment.

Start production mode using:

```bash
npm start
```

---

# 📜 Available Commands

```bash
npm install
```

Install dependencies.

```bash
npm run dev
```

Start development server.

```bash
npm run typecheck
```

Check TypeScript errors.

```bash
npm run lint
```

Run ESLint.

```bash
npm run build
```

Create optimized production build.

```bash
npm start
```

Start production server.

```bash
npm run db:push
```

Push Prisma schema to PostgreSQL.

```bash
npm run db:seed
```

Create initial Admin account.

```bash
npx prisma generate
```

Generate Prisma Client.

---

# 🌐 Application Routes

## Public

```text
/
```

Main entry page.

```text
/login
```

Secure login page.

---

## Admin

```text
/admin/dashboard
```

Admin Dashboard.

```text
/admin/users
```

Student Management.

```text
/admin/courses
```

Course Management / Course Studio.

```text
/admin/courses/[slug]
```

Course, Module and Lesson Management.

```text
/admin/analytics
```

LMS Analytics.

```text
/admin/settings
```

Admin Settings.

```text
/admin/change-password
```

Admin Password Security.

---

## Student

```text
/student/dashboard
```

Student Learning Dashboard.

```text
/student/courses/[slug]
```

Course Learning / Lesson Player.

```text
/student/change-password
```

Student Account Security.

---

# 📱 Responsive Design

Muhammad Kashif LMS is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

The interface includes responsive:

- Sidebars
- Navigation
- Dashboard Cards
- Tables
- Course Pages
- Lesson Pages
- Forms
- Login Interface

---

# 🎨 UI Design

The LMS uses a modern SaaS-inspired interface.

### Admin Portal

- Premium sidebar
- Light dashboard workspace
- Analytics cards
- Course statistics
- Student activity
- Modern tables
- Responsive navigation

### Student Portal

- Focused learning dashboard
- Course progress
- Learning navigation
- Modern lesson player
- Account security
- Responsive sidebar

### Login

- Modern split-screen layout
- Secure login form
- Premium dark learning panel
- Responsive mobile experience

---

# 🗃️ Core Database Models

The application includes database structures for areas such as:

```text
Users
Sessions
Courses
Sections
Lessons
Course Access
Lesson Progress
Login History
Security Alerts
Password Setup Tokens
```

These models provide the foundation for LMS functionality and security.

---

# 🔄 Learning Flow

The normal LMS learning flow is:

```text
Admin creates student
        ↓
Admin creates course
        ↓
Admin creates modules
        ↓
Admin adds lessons
        ↓
Admin assigns course
        ↓
Student logs in
        ↓
Student opens assigned course
        ↓
Student watches lessons
        ↓
Student marks lessons complete
        ↓
Progress updates
        ↓
Admin monitors learning activity
```

---

# 🔒 Security Recommendations for Production

For production deployment:

1. Always use HTTPS.
2. Never expose `.env`.
3. Use strong Admin passwords.
4. Use PostgreSQL SSL.
5. Keep Node.js dependencies updated.
6. Review `npm audit` reports before major dependency upgrades.
7. Avoid using `npm audit fix --force` without reviewing breaking changes.
8. Protect database credentials.
9. Regularly backup the PostgreSQL database.
10. Review login history and suspicious activity.

---

# 🧪 Quality Checks

Before deploying changes:

```bash
npm run typecheck
npm run lint
npm run build
```

All three should complete successfully.

---

# 🚀 Future Improvements

The architecture can be extended with features such as:

- Admin Security Center
- Advanced Audit Logs
- Two-Factor Authentication
- Password Recovery
- Email Notifications
- Student Announcements
- Course Certificates
- Quizzes
- Assignments
- Downloadable Resources
- Course Expiration
- Advanced Search
- Notifications
- Redis Rate Limiting
- Device / Active Session Management
- Student Reports
- Advanced Analytics

---

# 👨‍💻 Developer

**Muhammad Hamza**

Full Stack Developer

### GitHub

```text
https://github.com/hamzazkriya02
```

### LinkedIn

```text
https://www.linkedin.com/in/muhammad-hamza-315hz02
```

---

# 📌 Project

**Muhammad Kashif LMS**

A secure and premium Learning Management System for managing students, learning content, video lessons, course access, and student progress.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  <strong>Muhammad Kashif LMS</strong>
</p>

<p align="center">
  Built with Next.js • TypeScript • Prisma • PostgreSQL
</p>
