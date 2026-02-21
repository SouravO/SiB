/**
 * Seed script to load courses from courses.json into the database
 *
 * Usage: npx tsx database/seed-courses.ts
 *
 * Prerequisites:
 * 1. Run database/setup_courses.sql in Supabase SQL Editor first
 * 2. Set environment variables:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import coursesData from '../data/courses.json';

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 Setup Instructions:');
  console.error('1. Copy .env.local.example to .env.local (or edit existing .env.local)');
  console.error('2. Add your Supabase credentials:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('3. Run this script again');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map course names to categories and degrees
function categorizeCourse(courseName: string) {
  const name = courseName.toLowerCase();
  
  // Engineering/Tech
  if (name.includes('b.tech') || name.includes('b.e')) {
    return { category: 'Engineering', degree: name.includes('b.tech') ? 'B.Tech' : 'B.E', duration: 4 };
  }
  if (name.includes('m.tech') || name.includes('m.e')) {
    return { category: 'Engineering', degree: name.includes('m.tech') ? 'M.Tech' : 'M.E', duration: 2 };
  }
  if (name.includes('diploma')) {
    return { category: 'Engineering', degree: 'Diploma', duration: 3 };
  }
  
  // Computer Applications
  if (name.includes('bca')) {
    return { category: 'Computer Applications', degree: 'BCA', duration: 3 };
  }
  if (name.includes('mca')) {
    return { category: 'Computer Applications', degree: 'MCA', duration: 3 };
  }
  
  // Management
  if (name.includes('mba')) {
    return { category: 'Management', degree: 'MBA', duration: 2 };
  }
  if (name.includes('bba')) {
    return { category: 'Management', degree: 'BBA', duration: 3 };
  }
  
  // Commerce
  if (name.includes('b.com')) {
    return { category: 'Commerce', degree: 'B.Com', duration: 3 };
  }
  if (name.includes('m.com')) {
    return { category: 'Commerce', degree: 'M.Com', duration: 2 };
  }
  
  // Science
  if (name.includes('b.sc') && !name.includes('nursing')) {
    return { category: 'Science', degree: 'B.Sc', duration: 3 };
  }
  if (name.includes('m.sc')) {
    return { category: 'Science', degree: 'M.Sc', duration: 2 };
  }
  
  // Arts
  if (name.includes('b.a')) {
    return { category: 'Arts', degree: 'B.A', duration: 3 };
  }
  if (name.includes('m.a')) {
    return { category: 'Arts', degree: 'M.A', duration: 2 };
  }
  
  // Medical
  if (name.includes('mbbs')) {
    return { category: 'Medical', degree: 'MBBS', duration: 5.5 };
  }
  if (name.includes('bds')) {
    return { category: 'Medical', degree: 'BDS', duration: 5 };
  }
  if (name.includes('nursing')) {
    return { category: 'Medical', degree: 'B.Sc Nursing', duration: 4 };
  }
  if (name.includes('b.pharm')) {
    return { category: 'Pharmacy', degree: 'B.Pharm', duration: 4 };
  }
  if (name.includes('m.pharm')) {
    return { category: 'Pharmacy', degree: 'M.Pharm', duration: 2 };
  }
  if (name.includes('md')) {
    return { category: 'Medical', degree: 'MD', duration: 3 };
  }
  if (name.includes('ms') && !name.includes('master')) {
    return { category: 'Medical', degree: 'MS', duration: 3 };
  }
  if (name.includes('bpt')) {
    return { category: 'Medical', degree: 'BPT', duration: 4.5 };
  }
  if (name.includes('mpt')) {
    return { category: 'Medical', degree: 'MPT', duration: 2 };
  }
  
  // Hospitality
  if (name.includes('bhm')) {
    return { category: 'Hospitality', degree: 'BHM', duration: 4 };
  }
  if (name.includes('mhm')) {
    return { category: 'Hospitality', degree: 'MHM', duration: 2 };
  }
  
  // Design
  if (name.includes('b.des')) {
    return { category: 'Design', degree: 'B.Des', duration: 4 };
  }
  if (name.includes('m.des')) {
    return { category: 'Design', degree: 'M.Des', duration: 2 };
  }
  
  // Fashion
  if (name.includes('b.f.tech')) {
    return { category: 'Fashion', degree: 'B.F.Tech', duration: 4 };
  }
  if (name.includes('m.f.tech')) {
    return { category: 'Fashion', degree: 'M.F.Tech', duration: 2 };
  }
  
  // Architecture
  if (name.includes('b.arch')) {
    return { category: 'Architecture', degree: 'B.Arch', duration: 5 };
  }
  if (name.includes('m.arch')) {
    return { category: 'Architecture', degree: 'M.Arch', duration: 2 };
  }
  if (name.includes('b.plan')) {
    return { category: 'Architecture', degree: 'B.Plan', duration: 4 };
  }
  if (name.includes('m.plan')) {
    return { category: 'Architecture', degree: 'M.Plan', duration: 2 };
  }
  
  // Law
  if (name.includes('llb')) {
    return { category: 'Law', degree: 'LLB', duration: 3 };
  }
  if (name.includes('llm')) {
    return { category: 'Law', degree: 'LLM', duration: 2 };
  }
  
  // Education
  if (name.includes('b.ed')) {
    return { category: 'Education', degree: 'B.Ed', duration: 2 };
  }
  if (name.includes('m.ed')) {
    return { category: 'Education', degree: 'M.Ed', duration: 2 };
  }
  
  // Research
  if (name.includes('ph.d') || name.includes('phd')) {
    return { category: 'Research', degree: 'Ph.D', duration: 3 };
  }
  
  // Default
  return { category: 'General', degree: 'Certificate', duration: 1 };
}

async function seedCourses() {
  console.log('🌱 Starting course seeding...\n');
  
  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  // Prepare courses for insertion
  const courses = coursesData.map((course: any) => {
    const { category, degree, duration } = categorizeCourse(course.name);
    return {
      id: course.id, // Use the ID from courses.json
      name: course.name,
      slug: generateSlug(course.name),
      category,
      degree,
      duration_years: duration,
      description: null
    };
  });
  
  console.log(`📚 Found ${courses.length} courses to seed\n`);
  
  // Insert courses into database
  const { data, error } = await supabase
    .from('courses')
    .upsert(courses, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('❌ Error inserting courses:', error);
    console.error('\n📝 Database Setup Required:');
    console.error('1. Go to your Supabase dashboard → SQL Editor');
    console.error('2. Copy and run the contents of: database/setup_courses.sql');
    console.error('3. Then run this seed script again');
    process.exit(1);
  }
  
  console.log(`✅ Successfully seeded ${data?.length} courses!\n`);
  console.log('Sample courses:');
  data?.slice(0, 5).forEach((course: any) => {
    console.log(`  - ${course.name} (${course.category} - ${course.degree})`);
  });
  
  if (data && data.length > 5) {
    console.log(`  ... and ${data.length - 5} more`);
  }
  
  console.log('\n✨ Course seeding completed!');
}

// Run the seed function
seedCourses().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
