# Quantara — Priority Implementation Roadmap

## Objective

Improve Quantara's operational efficiency, admin responsiveness, and overall professionalism before adding non-essential UI improvements.

---

# Sprint 1 — Business Critical (Highest Priority)

These features directly affect day-to-day operations and customer trust.

## 1. Full Student Details Visibility for Admin

### Goal

Allow admins to view complete student registration information from a centralized dashboard.

### Admin Should See

* Full Name
* Email Address
* Phone Number
* Department
* Course Registered
* Package Selected
* Payment Status
* Delivery Location
* Registration Date

### Suggested Tech

* Supabase joins/relations
* React Data Tables
* TanStack Query

### Expected Outcome

Admins can efficiently manage, verify, and fulfill student registrations.

---

## 2. Telegram Registration Alerts

### Goal

Notify admins instantly when a new registration is completed.

### Why

Admins are students and are not logged into Quantara all day.

### Flow

Student Registers
↓
Registration Saved
↓
Backend Sends Telegram Notification
↓
Admin Group Receives Alert

### Suggested Tech

* Telegram Bot API
* node-telegram-bot-api or native fetch
* Express backend integration

### Example Alert

🔔 New Registration

Student: John Doe
Course: PHY 302
Package: Premium
Amount: ₦12,000

### Expected Outcome

Admins receive immediate notifications on an app they already use daily.

---

## 3. Payment Email Receipts

### Goal

Automatically send professional receipts after successful payment.

### Receipt Should Include

* Receipt Number
* Payment Reference
* Amount Paid
* Course
* Package
* Date
* Student Information

### Suggested Tech

* Resend
* Brevo
* Nodemailer (fallback)

### Flow

Paystack Success
↓
Registration Saved
↓
Receipt Email Sent

### Expected Outcome

Students receive proof of payment and gain confidence in the platform.

---

# Sprint 2 — Product Maturity

These features improve service quality and reduce support overhead.

## 4. Course Outline Upload

### Goal

Allow course outlines and supporting materials to be uploaded and attached to courses.

### Supported Formats

* PDF
* DOCX

### Suggested Tech

* Supabase Storage
* File upload component
* outline_url field on courses table

### Expected Outcome

Courses become more informative and useful to students.

---

## 5. Delivery Time Specification

### Goal

Allow students to specify exactly when and where they want deliveries.

### Current Problem

Locations alone are ambiguous.

Example:

Current:

* Hostel C

Improved:

* Hostel C
* Block B
* 5:00 PM

### Suggested Tech

* datetime-local input
* delivery_time column in registrations table

### Expected Outcome

Improved logistics and fewer delivery issues.

---

## 6. Lab Report Guidelines

### Goal

Provide clear instructions and expectations for lab report submissions.

### Suggested Content

* Formatting requirements
* Submission rules
* Required sections
* Deadlines
* Academic policies

### Suggested Tech

* Markdown content
* react-markdown
* Supabase Storage or database content

### Expected Outcome

Reduced support requests and better student submissions.

---

# Sprint 3 — UI & UX Improvements

## 7. Navbar Responsiveness

### Goal

Improve navigation experience on mobile devices.

### Suggested Tech

* Tailwind responsive utilities
* Mobile drawer navigation
* Radix UI Dialog/Sheet
* Lucide Icons

### Expected Outcome

Cleaner mobile experience and more polished presentation.


### Important Add On's
* The current logo for quantara is an image without story, generate an interactive log for quantara and replace the current logo accross all references and add the logo to the emails for payment receipts, and update the logo everywhere applicable
* Redesign the Dashbord Screen and Admin Screen, Basically all screen aside from the landing page, and signup and login, the design principle is that of the redesign when it came to the login and signup screens, with consistent icons and story telling subtle animations and the other redesign concepts you used
* When the admin view registred students and their lab guideline, stack the view and download button on top eachother
---

# Recommended Build Order

1. Full Student Details Visibility
2. Telegram Registration Alerts
3. Payment Email Receipts
4. Course Outline Upload
5. Delivery Time Specification
6. Lab Report Guidelines
7. Navbar Responsiveness

---

# Long-Term Notification Architecture

Student Registers
↓
Registration Saved
↓
Telegram Alert Sent to Admins
↓
Payment Receipt Sent to Student
↓
Stored in Admin Dashboard Notifications

This provides real-time operational awareness while maintaining a professional audit trail.

16:23
