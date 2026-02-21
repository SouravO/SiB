# 🎓 College Courses Feature - Complete Setup & Testing Guide

## ✅ What's Already Implemented

### 1. Add College Modal (Admin)
- **Location**: `/src/components/AddCollegeModal.tsx`
- **Feature**: Step 3 includes multi-select course picker
- **Saves to**: `college_courses` table

### 2. College Detail Page (User)
- **Location**: `/src/components/CollegeDetail.tsx`
- **Feature**: "Academic Programs" section displays courses
- **Fetches from**: `college_courses` table

### 3. User Dashboard
- **Location**: `/src/app/user/page.tsx`
- **Feature**: Click college → Opens modal with full details including courses

---

## 🔧 Setup Steps (Required)

### Step 1: Load Courses into Database

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com
   - Select your project
   - Click **SQL Editor** → **New query**

2. **Run the SQL Script**
   - Open file: `database/load_courses.sql`
   - Copy ALL content
   - Paste into SQL Editor
   - Click **RUN**

3. **Verify**
   - You should see: `total_courses: 50`
   - Go to **Table Editor** → **courses** → Should show 50 rows

---

## 🧪 Testing the Complete Flow

### Test 1: Add a College with Courses (Admin)

1. **Login to Admin Dashboard**
   - Go to: `/admin` (or your admin route)
   - Click "Add College"

2. **Fill Steps 1-2**
   - Step 1: Select State, City, University
   - Step 2: Enter college name and details

3. **Step 3 - Select Courses** ⭐
   - Scroll to "Courses Offered" section
   - Click the dropdown
   - Select multiple courses (e.g., B.Tech Computer Science, MBA, BCA)
   - Click "Done"
   - You should see selected courses as tags

4. **Complete Steps 4-5**
   - Step 4: Add images/videos (optional)
   - Step 5: Review and click "Save College"

5. **Check Console Logs** (F12 → Console tab)
   ```
   Linking courses to college: { collegeId: "...", courseIds: ["07", "05", "04"] }
   Inserting course links: [{ college_id: "...", course_id: "07" }, ...]
   ```

### Test 2: View College Details (User)

1. **Go to User Dashboard**
   - Navigate to: `/user`

2. **Select Filters**
   - Select State → City → University

3. **Click on a College**
   - Click any college card
   - Modal opens with full details

4. **Check for Courses Section** ⭐
   - Scroll to "Academic Programs" section
   - You should see all courses you selected in Test 1

5. **Check Console Logs** (F12 → Console tab)
   ```
   Fetching courses for college: "..."
   Fetched courses for college: { collegeId: "...", count: 3 }
   Course list: [{ id: "07", name: "B.Tech Computer Science" }, ...]
   ```

---

## 🐛 Troubleshooting

### Issue 1: "No courses showing in Add College modal"

**Check:**
1. Open browser console (F12)
2. Look for: `Loading courses...`
3. If you see `Failed to load courses`:
   - Run the SQL script again (Step 1 above)
   - Refresh the page

### Issue 2: "Courses not saving when adding college"

**Check Console Logs:**
```
Linking courses to college: { collegeId, courseIds }
Inserting course links: [...]
```

**If you see errors:**
1. Check Supabase → Table Editor → `college_courses`
2. Verify RLS policies are set correctly (SQL script includes them)

**Verify in Database:**
```sql
SELECT * FROM college_courses WHERE college_id = 'your-college-id';
```

### Issue 3: "Courses not showing on college detail page"

**Step 1: Check if courses were saved**
1. Go to Supabase → Table Editor
2. Open `college_courses` table
3. Filter by your college ID
4. You should see rows with course_id values

**Step 2: Check console logs**
```
Fetching courses for college: "..."
Fetched courses for college: { collegeId, count: X }
```

**Step 3: Test the query manually**
Run this in Supabase SQL Editor:
```sql
SELECT 
    cc.*,
    c.name,
    c.category,
    c.degree,
    c.duration_years
FROM college_courses cc
JOIN courses c ON c.id = cc.course_id
WHERE cc.college_id = 'YOUR-COLLEGE-ID';
```

### Issue 4: "Hydration mismatch error"

This is normal and not related to courses. It's a date format issue that doesn't affect functionality.

---

## 📊 Database Schema

### courses Table
```
id (TEXT, PK)          - Course ID from courses.json (e.g., "01", "07")
name (TEXT)            - Course name (e.g., "B.Tech Computer Science")
slug (TEXT, UNIQUE)    - URL-friendly name
category (TEXT)        - Category (Engineering, Management, etc.)
degree (TEXT)          - Degree type (B.Tech, MBA, etc.)
duration_years (DECIMAL) - Duration (3, 4, 5.5, etc.)
```

### college_courses Table (Junction)
```
id (UUID, PK)          - Unique ID
college_id (UUID, FK)  - References colleges(id)
course_id (TEXT, FK)   - References courses(id)
created_at (TIMESTAMP) - When linked
```

---

## 🔍 How to Verify Everything Works

### Quick Checklist

- [ ] SQL script ran successfully (50 courses loaded)
- [ ] Add College modal shows courses in Step 3
- [ ] Can select multiple courses
- [ ] Courses save to database (check `college_courses` table)
- [ ] College detail page shows "Academic Programs" section
- [ ] Selected courses appear on college page
- [ ] User dashboard modal shows courses

### Database Verification Queries

**Check courses exist:**
```sql
SELECT COUNT(*) FROM courses; -- Should return 50
```

**Check college has courses:**
```sql
SELECT c.name, cc.course_id 
FROM college_courses cc 
JOIN courses c ON c.id = cc.course_id 
WHERE cc.college_id = 'your-college-id';
```

**Check all courses for a specific college:**
```sql
SELECT 
    c.name,
    c.category,
    c.degree,
    c.duration_years
FROM college_courses cc
JOIN courses c ON c.id = cc.course_id
WHERE cc.college_id = 'your-college-id'
ORDER BY c.category, c.name;
```

---

## 📝 Files Modified/Created

### Modified Files
- `/src/components/CollegeDetail.tsx` - Added console logging for debugging
- `/src/app/actions/colleges.ts` - Added logging to `getCoursesByCollege` and `linkCoursesToCollege`

### Created Files
- `/database/load_courses.sql` - Complete SQL script to set up courses
- `/COURSE_FEATURE_SETUP.md` - This guide

---

## 🎯 Expected Behavior

### When Adding College (Admin):
1. Step 3 shows "Courses Offered" dropdown
2. Click dropdown → See all 50 courses
3. Can search and filter courses
4. Can select multiple courses
5. Selected courses appear as tags
6. On save → Courses saved to `college_courses` table

### When Viewing College (User):
1. Click college card → Modal opens
2. Scroll to "Academic Programs" section
3. See grid of all courses offered by that college
4. Each card shows: Name, Category, Degree, Duration

---

## 💡 Pro Tips

1. **Always check console logs** - They show exactly what's happening
2. **Verify in Supabase Table Editor** - See if data is actually saved
3. **Test with one college first** - Add one college with 2-3 courses
4. **Use the SQL queries above** - Manually verify data exists

---

## 🆘 Still Having Issues?

1. **Open browser console** (F12)
2. **Take screenshot** of any errors
3. **Check these tables** in Supabase:
   - `courses` (should have 50 rows)
   - `college_courses` (should have rows for colleges with courses)
4. **Run verification queries** from above

---

## ✨ Next Steps

Once everything works:
- Add more colleges with different course combinations
- Test search/filter functionality
- Customize course display styling if needed
- Add course-specific features (eligibility, fees, etc.)
