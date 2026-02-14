import { getCollegeBySlug } from '@/app/actions/colleges';
import CollegeDetailComponent from '@/components/CollegeDetail';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const result = await getCollegeBySlug(params.slug);

  if (!result.success || !result.data) {
    return {
      title: 'College Not Found',
      description: 'The requested college could not be found.'
    };
  }

  const college = result.data;

  return {
    title: `${college.name} - StudyInBengaluru`,
    description: college.short_description || `Information about ${college.name}`,
  };
}

export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  const result = await getCollegeBySlug(params.slug);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">College Not Found</h3>
          <p className="text-slate-400">The requested college could not be found.</p>
        </div>
      </div>
    );
  }

  // Pass the college ID to the client component
  return <CollegeDetailComponent collegeId={result.data.id} />;
}