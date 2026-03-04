# University Creation Debugging Guide

## Problem
Universities are not being added consistently. This guide helps debug and fix the issue.

## Changes Made

### 1. Enhanced Error Logging in `createUniversity()`
The function now:
- Logs the university creation attempt with all parameters
- Validates that the city exists before insertion
- Checks for duplicate universities with similar names
- Returns specific error messages based on error codes
- Logs detailed database errors including code, message, details, and hint

### 2. Enhanced Component Logging
`UniversityManagementClient` now:
- Logs the creation attempt with name and city ID
- Logs the result from the server action
- Shows more helpful error messages to users

## How to Debug

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Try adding a university

### Step 2: Look for These Logs

**Creation Attempt:**
```
[UniversityManagementClient] Creating university: { name: "...", cityId: "..." }
```

**Server-Side Logs:**
```
[createUniversity] Attempting to create university: { name: "...", slug: "...", cityId: "..." }
```

**Possible Error Logs:**

1. **City Not Found:**
   ```
   [createUniversity] City not found: { cityId: "...", cityError: {...} }
   ```
   **Fix:** Ensure the city exists in the database

2. **Duplicate University:**
   ```
   [createUniversity] University with similar name already exists: { id: "...", name: "..." }
   ```
   **Fix:** Use a different university name

3. **Database Error:**
   ```
   [createUniversity] Database error: { code: "...", message: "...", details: "...", hint: "..." }
   ```
   Common error codes:
   - `23505`: Unique constraint violation (duplicate name/slug)
   - `23503`: Foreign key constraint violation (invalid city_id)
   - `42P01`: Table doesn't exist
   - `42703`: Column doesn't exist

### Step 3: Check Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor** → `universities`
2. Check if any entries were created (even partially)
3. Look at the **Logs** section in Supabase for database errors

### Step 4: Verify Database Schema

Run this query in Supabase **SQL Editor** to check the universities table structure:

```sql
-- Check universities table structure
\d universities

-- Or use this query:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'universities'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid, primary key)
- `name` (text)
- `slug` (text, unique)
- `city_id` (uuid, foreign key to cities)
- `image_url` (text, nullable)
- `created_at` (timestamptz)

### Step 5: Check RLS Policies

Run this in Supabase SQL Editor:

```sql
-- Check RLS policies for universities table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'universities';
```

Expected policies:
- `Public can view universities` (SELECT)
- `Authenticated users can insert universities` (INSERT)
- `Authenticated users can update universities` (UPDATE)
- `Authenticated users can delete universities` (DELETE)

If policies are missing, run:
```sql
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view universities" ON universities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert universities" ON universities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update universities" ON universities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete universities" ON universities
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Step 6: Test City Existence

Run this query, replacing `{CITY_ID}` with the actual city ID:

```sql
SELECT id, name 
FROM cities 
WHERE id = '{CITY_ID}';
```

If no result, the city doesn't exist and you need to add it first.

### Step 7: Check for Duplicate Slugs

```sql
-- Check if a university with similar slug exists
SELECT id, name, slug 
FROM universities 
WHERE slug = 'your-university-name-slug';
```

## Common Issues and Solutions

### Issue 1: "City not found" Error
**Cause:** The selected city doesn't exist in the database

**Solution:**
1. Add a city first through the College Management interface
2. Or run this SQL to add a test city:
   ```sql
   INSERT INTO cities (name, state_id) 
   VALUES ('Test City', '{STATE_ID}')
   RETURNING *;
   ```

### Issue 2: "University already exists" Error
**Cause:** A university with the same name (or similar name generating the same slug) exists

**Solution:**
1. Use a different university name
2. Or delete the existing university if it was created by mistake:
   ```sql
   DELETE FROM universities WHERE name = 'Existing University Name';
   ```

### Issue 3: Silent Failure (No Error Shown)
**Cause:** RLS policies blocking the insert, or missing service role key

**Solution:**
1. Check browser console for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
3. Check Supabase logs for permission errors

### Issue 4: Foreign Key Constraint Violation
**Cause:** The `city_id` references a non-existent city

**Solution:**
1. Verify the city exists before creating the university
2. Use the city dropdown (don't manually enter IDs)

## Testing Checklist

- [ ] Browser console shows `[UniversityManagementClient] Creating university:` log
- [ ] Server logs show `[createUniversity] Attempting to create university:`
- [ ] City validation passes (city exists check)
- [ ] No duplicate university warning
- [ ] Database insert succeeds
- [ ] Success toast appears
- [ ] University list refreshes and shows new entry

## Quick Test Query

After attempting to create a university, run this to see all universities:

```sql
SELECT 
    u.id,
    u.name,
    u.slug,
    u.created_at,
    c.name as city_name,
    s.name as state_name
FROM universities u
LEFT JOIN cities c ON u.city_id = c.id
LEFT JOIN states s ON c.state_id = s.id
ORDER BY u.created_at DESC
LIMIT 10;
```

## Additional Debugging Tools

### Enable Supabase Debug Logging
Add this to your `.env.local`:
```
SUPABASE_DEBUG=true
```

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "fetch" or "XHR"
3. Look for the request to create university
4. Check the response body for detailed errors

### Use the Test API

I've created test API endpoints to help you debug:

**1. Test City Existence:**
```bash
# Check if a specific city exists
curl "http://localhost:3000/api/test-city?id=YOUR_CITY_ID"

# Or get all available cities
curl "http://localhost:3000/api/test-city"
```

**2. Test University Creation:**
```bash
curl -X POST "http://localhost:3000/api/test-create-university" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test University","cityId":"YOUR_CITY_ID"}'
```

These endpoints return detailed error information including:
- Database error codes
- Full error messages
- Constraint violation details
- Available cities if the specified one doesn't exist

**3. Interactive Test in Browser:**

Open your browser console and run:
```javascript
// Test with your actual city ID
fetch('/api/test-city')
  .then(r => r.json())
  .then(data => {
    console.log('Available cities:', data.availableCities);
    console.log('Copy a city ID and try creating a university:');
    console.log(`fetch('/api/test-create-university', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: 'My Test University',
        cityId: '${data.availableCities?.[0]?.id}'
      })
    }).then(r => r.json()).then(console.log)`);
  });
```

## Contact/Support

If issues persist:
1. Copy the full console error output
2. Include the Supabase query logs
3. Share the network request/response details
