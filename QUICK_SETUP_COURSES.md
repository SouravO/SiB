# ⚡ Quick Setup: Load Courses from courses.json

## Problem
You have `courses.json` with 50 courses but they're not showing in the Add College modal.

## Solution

The courses need to be loaded into your Supabase database. Follow these steps:

---

## Step 1: Go to Supabase SQL Editor

1. Open your Supabase dashboard: https://app.supabase.com
2. Select your project: **yllxodvipzhfgfnhpvug**
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

---

## Step 2: Run the SQL Script

1. Open the file: `database/setup_courses_from_json.sql`
2. Copy **ALL** the content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl/Cmd + Enter`)

You should see a result showing `total_courses: 50`

---

## Step 3: Verify in Dashboard

1. Go to **Table Editor** in the left sidebar
2. Click on the **courses** table
3. You should see all 50 courses loaded

---

## Step 4: Test in Your App

1. Start your development server (if not already running):
   ```bash
   npm run dev
   ```

2. Go to the Add College page/modal

3. Navigate to **Step 3: Descriptions**

4. Scroll to the "Courses Offered" section

5. Click the dropdown - you should now see all 50 courses!

---

## Troubleshooting

### "relation 'courses' does not exist"
The SQL script will create the table automatically. Just run it.

### Courses still not showing
1. Open browser console (F12)
2. Look for errors related to courses
3. Check if the courses table exists in Supabase

### Permission errors
The SQL script includes RLS policies that allow:
- **Public** to view courses (SELECT)
- **Authenticated users** to insert/update/delete

---

## What This Does

The SQL script:
1. ✅ Creates the `courses` table
2. ✅ Creates the `college_courses` junction table
3. ✅ Sets up proper indexes for performance
4. ✅ Configures Row Level Security (RLS) policies
5. ✅ Inserts all 50 courses from `courses.json`

---

## Course Categories

The 50 courses are organized into these categories:
- **Engineering** (14 courses) - B.Tech, M.Tech, B.E, M.E, Diploma
- **Computer Applications** (3 courses) - BCA, MCA
- **Management** (2 courses) - MBA, BBA
- **Commerce** (2 courses) - B.Com, M.Com
- **Science** (3 courses) - B.Sc, M.Sc
- **Arts** (2 courses) - B.A, M.A
- **Medical** (7 courses) - MBBS, BDS, MD, MS, BPT, MPT, Nursing
- **Pharmacy** (2 courses) - B.Pharm, M.Pharm
- **Hospitality** (2 courses) - BHM, MHM
- **Design** (2 courses) - B.Des, M.Des
- **Fashion** (2 courses) - B.F.Tech, M.F.Tech
- **Architecture** (4 courses) - B.Arch, M.Arch, B.Plan, M.Plan
- **Law** (2 courses) - LLB, LLM
- **Education** (2 courses) - B.Ed, M.Ed
- **Research** (1 course) - Ph.D

---

## Files Involved

- `data/courses.json` - Source data with 50 courses
- `database/setup_courses_from_json.sql` - SQL script to run (NEW ✨)
- `database/seed-courses.ts` - Alternative Node.js seed script
- `src/components/CourseMultiSelect.tsx` - UI component
- `src/components/AddCollegeModal.tsx` - Modal with course selection
- `src/components/CollegeDetail.tsx` - Displays courses on college page

---

## Need Help?

Check these files for more details:
- `COURSE_MULTI_SELECT.md` - Complete feature documentation
- `SUPABASE_SETUP.md` - Supabase configuration guide
- `DATABASE_SETUP.md` - Database setup guide
