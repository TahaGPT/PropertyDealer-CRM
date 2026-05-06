Instructions
● Develop a full-stack CRM system for property dealers using Next.js (App Router),
MongoDB, and related technologies.
● The system should simulate a real-world industry-level CRM used by property dealers in
Pakistan.
● You are not allowed to copy/paste code from the internet as it is. Zero for plagiarism.
● At least 70% of the code must be written by yourself.
● You must be able to explain your architecture, authentication flow, database design, and
business logic during the demo.
Overview
The Property Dealer CRM System is designed to help real estate agents manage and track leads
efficiently. Property dealers receive leads from multiple sources such as:
● Facebook Ads
● Walk-in clients
● Website inquiries
Managing these leads manually becomes inefficient and error-prone. Your task is to build a
Level 3 CRM system that solves this problem. The system should provide a centralized platform
to:
• Store and manage leads
• Assign leads to agents
• Track lead status and activity
• Prioritize leads based on scoring logic
• Provide analytics and insights
How the CRM System Works
Each lead represents a potential client interested in buying or investing in property.
The system processes leads by:
• Storing client details in the database
• Assigning leads to agents by the admin
• Updating lead status (New, Contacted, Closed, etc.)
• Scoring leads based on predefined rules
• Displaying real-time updates across dashboards
The system ensures that:
• High-priority leads are handled first
• Agents only see their assigned leads
• Admin has full visibility of all activities
Tech Stack:
• Next.js (App Router)
• MongoDB with Mongoose
• NextAuth / JWT Authentication
• Socket.io (or polling for real-time updates)
• Tailwind CSS
• Node.js API Routes / Server Actions
Core Requirements:
Authentication System
Implement a complete authentication system:
• User Signup & Login
• Password hashing (bcrypt or equivalent)
• JWT / NextAuth session handling
Role-Based Access Control (RBAC)
Roles:
• Admin: Full system access
• Agent: Limited access (only assigned leads)
Restrict routes based on roles & protect sensitive operations
Lead Management System (CRUD)
Create a Lead model with the following fields:
name, email, propertyInterest, budget, status, notes, assignedTo, score, createdAt
Implement full CRUD operations:
• Create new leads
• View all leads (Admin) / Assigned leads (Agent)
• Update lead details & delete leads
Lead Scoring System
Implement rule-based scoring logic:
• Budget > 20M → High Priority
• Budget 10M–20M → Medium Priority
• Budget < 10M → Low Priority
Features:
• Automatically assign score on lead creation
• Highlight high-priority leads in dashboard
Scoring should be handled in backend (API or model middleware) during lead creation
Lead Assignment System
Admin functionality:
• Assign leads to agents
• Reassign leads when needed
Agent functionality:
• View only assigned leads
Real-time Lead Updates (Socket.io or Polling)
• Implement real-time updates for better responsiveness
• Notify admin/agents when: New lead is created, lead is assigned or reassigned, lead
priority changes.
• Use Socket.io preferred for real-time bidirectional updates
• Fallback option: periodic polling if WebSockets are not available
• Ensure UI reflects updates without manual refresh
WhatsApp Integration
Implement click-to-chat feature:
• Redirect to WhatsApp using lead phone number
• Ensure phone number is in international format (without + sign)
• Format: https://wa.me <countrycode><number>
Email Notification System
Send email notifications when:
• New lead is created
• Lead is assigned to an agent
Create properly formatted email templates for each notification type (e.g., new lead alert,
assignment confirmation)
Lead Activity Timeline (Audit Trail System)
Implement a complete activity tracking system for each lead:
• Record every action performed on a lead (lead creation, status updates,
assignment/reassignment, notes updates)
• Display a chronological timeline for each lead
• Maintain an Activity Log model to store historical events
Smart Follow-up Reminder System
Implement a follow-up tracking system for agents:
• Allow agents to set follow-up dates for leads
• System automatically detects:
1. Leads with overdue follow-ups
2. Leads with no activity for a defined period.
• Highlight stale or pending follow-ups in dashboard
Analytics Dashboard
The Admin dashboard will provide an overview of the system.
It will:
• Display total number of leads
• Show lead distribution based on status (e.g., New, Assigned, In Progress, Closed)
• Show lead distribution based on priority levels (High, Medium, Low)
• Provide an agent performance overview
• Allow Admin to monitor how effectively each agent is handling assigned leads
• Include insights such as leads handled per agent and their progress status
UI Requirements
• Admin Dashboard with analytics cards
• Agent Dashboard with assigned leads
• Filters (status, priority, date)
• Responsive and mobile-friendly design
Bonus Features:
• AI-based follow-up suggestion system
• Export leads to Excel / PDF
• Lead history tracking (timeline)
• Activity logs (who updated what)
Middleware Requirements:
Validation Middleware
Ensures that all incoming data is correct and safe before processing:
• Checks request body for required fields and proper format
• Validates query parameters and route parameters
• Prevents invalid or incomplete data from entering the system
• Returns clear and meaningful error messages for invalid requests
Authentication Middleware
Handles user identity verification for secure access:
• Verifies JWT tokens or active user sessions
• Ensures only authenticated users can access protected routes
• Rejects unauthorized requests with proper error responses
Rate Limiting
Controls the number of requests to ensure system stability and prevent misuse:
• Applies request limits per user or IP
• Agents have stricter limits to control usage and prevent abuse (50 requests per Minute)
• Admins have relaxed or no limits for uninterrupted system management (No limit or
significantly higher limit)
Submission Guidelines
1. GitHub Repository
• Submit the GitHub repository link containing your complete project code.
• The repository must include meaningful and regular commits showing step-by-step
development progress.
• Avoid single or last-minute commits, as this may result in marks deduction.
• Bonus: Per-Feature Branching
Use separate Git branches for each feature (e.g., authentication, role-based access control,
lead management, middleware, real-time updates, analytics dashboard) to show organized
and modular development workflow.
2. Source Code (ZIP Folder)
• Upload the full project source code in a ZIP file.
• The ZIP must include:
o All source files
o Configuration files (.env.example, package.json, etc.)
o Do NOT include node_modules folder
3. PDF Report containing:
The PDF report must include the screenshots of system UI, including:
• Dashboard (Admin analytics overview)
• Leads management page
• Analytics section (charts and insights)
4. Deployed project & Demo Video
• Working deployed project (Vercel recommended)
• Short demo video showcasing system functionality (optional but recommended)
Naming Convention:
2XX-XXXX-Section
Evaluation Criteria (120 Marks)
Category Component Criteria Summary Marks
Authentication
System
Login & Signup Secure user authentication with proper
signup/login flow, password hashing (bcrypt or
equivalent), and session/JWT handling
15
Role-Based Access
Control
Admin & Agent
Roles
Proper implementation of roles (Admin/Agent),
route protection, and access restriction based on
user role
15
Lead Management
System (CRUD)
Lead Operations Complete CRUD operations for leads, correct
schema usage, proper data handling for create,
read, update, delete
15
Lead Scoring
System
Priority Logic Rule-based scoring implementation
(High/Medium/Low based on budget), autoassignment on lead creation, correct backend
logic
10
Real-time Updates Socket.io / Polling Live updates for lead creation, assignment, and
status changes without page refresh using
Socket.io or polling fallback
10
Analytics
Dashboard
Admin Insights Dashboard showing total leads, status
distribution, priority distribution, and agent
performance insights
10
WhatsApp + Email
Integration
External
Communication
Click-to-chat WhatsApp integration with
correct formatting and email notifications for
lead creation and assignment with proper
templates
10
Lead Activity
Timeline
Audit Trail System Complete tracking of all lead actions (create,
update, assign, notes), chronological timeline
with activity log storage
10
Smart Follow-up
System
Follow-up Logic Follow-up date handling, detection of
overdue/inactive leads, and highlighting stale
leads in dashboard
10
Code Quality &
Structure
Organization &
Best Practices
Clean modular code, proper folder structure,
reusable components, and meaningful naming
conventions
10
Documentation +
Commits
PDF Submission &
Git commits
Required screenshots and meaningful git
commits
5
Bonus Features Advanced
Enhancements
AI-based follow-up suggestions, export leads
(Excel/PDF), advanced filtering/search, activity
logs with detailed tracking.
+10