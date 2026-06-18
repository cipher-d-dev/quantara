# Quantara AI

## Overview

Quantara AI is a web platform that automates the creation of engineering laboratory reports in realistic handwritten notebook format.

Students upload their experiment details, readings, and handwriting samples. The platform generates a complete lab report, renders it in the student's handwriting style using blue ink, draws hand-sketched diagrams and graphs, and exports the result as a notebook-style PDF.

The goal is to eliminate the manual effort of writing lengthy lab reports while preserving the handwritten format required by many institutions.

---

# Core Features

## Student Authentication

- Register/Login
- Dashboard
- Slot-based submission system
- Request history
- Download generated reports

---

## Lab Report Generation

Students provide:

- Course code
- Experiment title
- Aim
- Apparatus
- Theory notes (optional)
- Raw observations/readings
- Lecturer instructions
- Preferred report format

AI generates:

- Title page
- Aim
- Apparatus
- Theory
- Procedure
- Observation tables
- Calculations
- Results
- Discussion
- Conclusion
- References

---

## Handwriting Learning

Students upload:

- 5–10 pages of handwritten notes

System extracts:

- Character shapes
- Letter spacing
- Writing slant
- Writing size

System creates a reusable handwriting profile.

---

## Handwritten Report Rendering

Generated report is converted into:

- Blue pen handwriting
- Notebook paper pages
- Natural spacing variations
- Line-by-line writing
- Multi-page report format

---

## Hand-Drawn Sketch Generation

Automatically generates:

- Circuit diagrams
- Block diagrams
- Engineering apparatus sketches
- Graphs
- Tables
- Flowcharts

Rendered to look hand drawn rather than computer generated.

---

## PDF Export

Output:

- Multi-page notebook PDF
- Blue ink handwriting
- Hand-drawn diagrams
- Ready for printing or copying

---

# Architecture

Frontend (React + Vite)

↓

Express API

↓

PostgreSQL

↓

BullMQ + Redis Queue

↓

Python AI Service (FastAPI)

↓

Report Generator + Handwriting Engine + Diagram Renderer

---

# Tech Stack

## Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- TanStack Query
- React Router
- shadcn/ui

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer
- BullMQ
- Redis

---

## AI Service

- Python
- FastAPI
- PyTorch
- Pillow
- OpenCV
- NumPy

---

# Open Source / Free Tools

## Report Generation

### Primary

OpenRouter

Benefits:

- Free models available
- OpenAI-compatible API
- Can switch models without changing code

Recommended Models:

- DeepSeek
- Qwen
- Gemma
- Llama

Expected Cost:

- Free during development
- Under ₦5,000/month for early usage if using inexpensive models

---

## Handwriting Generation

### Phase 1 (MVP)

Font-based approach

Tools:

- FontForge
- Calligraphr
- TraceFont

Benefits:

- Free or low cost
- Fast implementation
- Good enough for MVP

---

### Phase 2 (Advanced)

AI handwriting synthesis

Research Projects:

- GANWriting
- DeepWriting
- Diffusion-based handwriting models

Benefits:

- More realistic output
- Can imitate individual writing styles

Drawback:

- Higher complexity

---

## Diagram Generation

### RoughJS

Purpose:

Creates diagrams that appear hand drawn.

Used for:

- Graphs
- Circuits
- Flowcharts
- Engineering sketches

Cost:

Free and open source

---

## Notebook Rendering

Tools:

- Pillow
- OpenCV

Responsibilities:

- Blue pen effect
- Paper texture
- Notebook lines
- Ink variations
- Page composition

Cost:

Free

---

## PDF Generation

Options:

- pdf-lib
- PDFKit

Cost:

Free

---

# Job Processing

## Queue System

Tools:

- Redis
- BullMQ

Workflow:

Student submits report

↓

Queue job

↓

Generate report

↓

Generate handwriting

↓

Generate diagrams

↓

Generate notebook pages

↓

Generate PDF

↓

Notify student

---

# Database Tables

users

handwriting_profiles

lab_reports

generated_pages

slots

payments

notifications

---

# Estimated Monthly Cost

Development Stage:

₦0 – ₦5,000/month

Production (First 100–300 Users):

₦5,000 – ₦20,000/month

Major expenses:

- Hosting
- Database
- AI API usage

Most rendering, handwriting generation, PDF creation, and diagram generation can remain completely open source.

---

# MVP Goal

A student uploads experiment details and handwriting samples.

The system automatically:

1. Generates a complete lab report.
2. Renders it in blue handwritten style.
3. Generates hand-drawn diagrams and graphs.
4. Places everything on notebook paper.
5. Exports a multi-page PDF.

Result:

A realistic handwritten engineering lab report generated with minimal human effort.
