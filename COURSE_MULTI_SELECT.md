# Course Multi-Select Implementation Guide

## Overview

This guide explains how the course multi-select feature works in the Add College modal and how courses are displayed on college pages.

## Features Implemented

### 1. Add College Modal - Course Selection (Step 3)

When adding a new college, users can select multiple courses in **Step 3: Descriptions**:

- **Multi-select dropdown**: Click to open a searchable dropdown
- **Search functionality**: Filter courses by name or degree
- **Category filter**: Filter courses by category (Engineering, Management, Medical, etc.)
- **Select All**: Quickly select all courses in a category
- **Visual feedback**: Selected courses appear as tags with remove buttons

### 2. College Detail Page - Course Display

Courses are displayed on the college page under the **"Academic Programs"** section:

- Grid layout showing all linked courses
- Each course card displays:
  - Course name
  - Category badge
  - Degree type
  - Duration

## Files Involved

### Components
- `/src/components/AddCollegeModal.tsx` - Main modal with course selection integrated
- `/src/components/CourseMultiSelect.tsx` - Reusable multi-select component
- `/src/components/CollegeDetail.tsx` - Displays courses on college page

### Backend Actions
- `/src/app/actions/colleges.ts`
  - `getAllCourses()` - Fetch all available courses
  - `linkCoursesToCollege()` - Link selected courses to a college
  - `getCoursesByCollege()` - Fetch courses for a specific college

### Database
- `/database/setup_courses.sql` - Database schema for courses
- `/database/seed-courses.ts` - Seed script to populate courses
- `/data/courses.json` - Course data source

## Setup Instructions

### 1. Seed the Database with Courses

Run the seed script to populate the courses table:

```bash
# Make sure you have the environment variables set
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the seed script
npx tsx database/seed-courses.ts
```

This will:
- Load all 50 courses from `data/courses.json`
- Automatically categorize them (Engineering, Management, Medical, etc.)
- Set appropriate degree names and durations
- Insert into the database with unique IDs

### 2. Using the Feature

#### Adding a College with Courses

1. Click "Add College" button
2. Complete Step 1 (Location) and Step 2 (Basic Info)
3. In **Step 3: Descriptions**:
   - Scroll to the "Courses Offered" section
   - Click the dropdown to open course selection
   - Search or browse courses
   - Click courses to select/deselect
   - Use "Select All" for bulk selection
   - Click "Done" when finished
4. Continue to Step 4 (Media) and Step 5 (Review)
5. Click "Save College"

#### Viewing Courses on College Page

1. Navigate to any college page: `/colleges/[slug]`
2. Scroll to the "Academic Programs" section
3. View all courses offered by that college in a grid layout

## Course Categories

The system automatically categorizes courses into:

- **Engineering** - B.Tech, M.Tech, B.E, M.E, Diploma
- **Computer Applications** - BCA, MCA
- **Management** - MBA, BBA
- **Commerce** - B.Com, M.Com
- **Science** - B.Sc, M.Sc
- **Arts** - B.A, M.A
- **Medical** - MBBS, BDS, MD, MS, BPT, MPT
- **Pharmacy** - B.Pharm, M.Pharm
- **Hospitality** - BHM, MHM
- **Design** - B.Des, M.Des
- **Fashion** - B.F.Tech, M.F.Tech
- **Architecture** - B.Arch, M.Arch, B.Plan, M.Plan
- **Law** - LLB, LLM
- **Education** - B.Ed, M.Ed
- **Research** - Ph.D

## Database Schema

### courses Table
```sql
- id: UUID (Primary Key)
- name: TEXT (Course name)
- slug: TEXT (URL-friendly identifier)
- category: TEXT (e.g., "Engineering", "Management")
- degree: TEXT (e.g., "B.Tech", "MBA")
- duration_years: DECIMAL (e.g., 4, 2, 3.5)
- description: TEXT (Optional)
- created_at: TIMESTAMPTZ
```

### college_courses Table (Junction Table)
```sql
- id: UUID (Primary Key)
- college_id: UUID (Foreign Key → colleges)
- course_id: UUID (Foreign Key → courses)
- created_at: TIMESTAMPTZ
- UNIQUE(college_id, course_id)
```

## API Functions

### Get All Courses
```typescript
const result = await getAllCourses();
// Returns: { success: boolean, data: Course[] }
```

### Link Courses to College
```typescript
const result = await linkCoursesToCollege(collegeId, ['course-id-1', 'course-id-2']);
// Returns: { success: boolean }
```

### Get Courses by College
```typescript
const result = await getCoursesByCollege(collegeId);
// Returns: { success: boolean, data: CollegeCourse[] }
```

## Troubleshooting

### Courses Not Showing in Dropdown

1. Verify courses are seeded in the database:
   ```bash
   npx tsx database/seed-courses.ts
   ```

2. Check browser console for errors
3. Verify RLS policies allow public read access

### Courses Not Displaying on College Page

1. Ensure courses were properly linked during college creation
2. Check the `college_courses` table for entries
3. Verify the college ID is correct

### Seed Script Fails

1. Check environment variables are set correctly
2. Verify Supabase URL and service role key
3. Ensure the `courses` table exists in the database

## Future Enhancements

Potential improvements:

- [ ] Add course descriptions
- [ ] Filter colleges by available courses
- [ ] Search colleges by course name
- [ ] Add course-specific eligibility criteria
- [ ] Add course fee structure
- [ ] Add course intake capacity

## Support

For issues or questions, refer to:
- `/SUPABASE_SETUP.md` - Supabase configuration
- `/DATABASE_SETUP.md` - Database setup guide
- `/README.md` - General project documentation
