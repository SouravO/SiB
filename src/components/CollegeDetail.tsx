'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCollegeById, getCoursesByCollege } from '@/app/actions/colleges';

interface CollegeImage {
  id: string;
  image_url: string;
  caption?: string;
  display_order: number;
}

interface CollegeVideo {
  id: string;
  video_url: string;
  title?: string;
  platform?: string;
  display_order: number;
}

interface Course {
  id: string;
  name: string;
  slug: string;
  category: string;
  degree: string;
  duration_years: number;
}

interface CollegeDetailProps {
  collegeId: string;
  showHeader?: boolean;
}

export default function CollegeDetail({ collegeId, showHeader = true }: CollegeDetailProps) {
  const [college, setCollege] = useState<any>(null);
  const [images, setImages] = useState<CollegeImage[]>([]);
  const [videos, setVideos] = useState<CollegeVideo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        const result = await getCollegeById(collegeId);

        if (result.success) {
          setCollege(result.data);
          setImages(result.data.images || []);
          setVideos(result.data.videos || []);

          // Fetch courses for this college
          console.log('Fetching courses for college:', collegeId);
          const coursesResult = await getCoursesByCollege(collegeId);
          console.log('Courses result:', coursesResult);
          if (coursesResult.success && coursesResult.data) {
            const courseList = coursesResult.data.map((cc: any) => cc.courses).filter(Boolean);
            console.log('Course list:', courseList);
            setCourses(courseList);
          }
        } else {
          setError(result.error || 'Failed to fetch college details');
        }
      } catch (err) {
        setError('An error occurred while fetching college details');
        console.error('Error fetching college details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (collegeId) {
      fetchCollegeDetails();
    }
  }, [collegeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-2 border-purple-600 border-t-white animate-spin rounded-full mb-4"></div>
          <p className="text-white/40 font-medium tracking-widest uppercase text-xs">Loading</p>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="text-center p-10 bg-[#111111] border border-white/10 rounded-3xl max-w-md">
          <h3 className="text-2xl font-bold text-white mb-2">{error ? 'Error' : 'Not Found'}</h3>
          <p className="text-white/50 mb-6">{error || 'The requested college could not be found.'}</p>
          <button onClick={() => window.history.back()} className="text-purple-500 font-bold uppercase tracking-tighter hover:text-white transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-purple-600 selection:text-white">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-16 border-b border-white/5 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight italic uppercase">
              {college.name}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
              <span className="text-purple-500">{college.specialization}</span>
              <span>•</span>
              <span>{college.universities?.name}</span>
              <span>•</span>
              <span className="text-white/60">
                {college.universities?.cities?.name}, {college.universities?.cities?.states?.name}
              </span>
            </div>
          </div>

          {showHeader && (
            <button
              onClick={() => window.history.back()}
              className="group relative px-8 py-4 bg-white text-black font-black uppercase text-sm tracking-tighter hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              Back to Search
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* About */}
            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8">Overview</h2>
              <div className="bg-[#111111] p-1 border-white/5 border">
                <div className="bg-[#0A0A0A] p-8 md:p-12">
                   {college.long_description ? (
                    <p className="text-white/70 text-lg leading-relaxed font-light">
                      {college.long_description}
                    </p>
                  ) : (
                    <p className="text-white/30 italic">Information pending update.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Courses Offered */}
            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8">Academic Programs</h2>
              <div className="bg-[#111111] p-1 border-white/5 border">
                <div className="bg-[#0A0A0A] p-8 md:p-12">
                  {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="group bg-[#111111] border border-white/5 hover:border-purple-500/30 p-6 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                                {course.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-bold text-purple-400 uppercase border border-purple-500/30 px-2 py-0.5">
                                  {course.category}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                  {course.degree}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                              {course.duration_years} {course.duration_years === 1 ? 'year' : 'years'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-zinc-500 text-sm">
                        {loading
                          ? 'Loading courses...'
                          : 'No courses added yet for this college.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Campus Photos */}
            {images.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8">Visuals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="group overflow-hidden bg-[#111111]">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'College photo'}
                        className="w-full h-[400px] object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                      />
                      {image.caption && (
                        <div className="p-4 border-t border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-8">Cinematics</h2>
                <div className="space-y-6">
                  {videos.map((video) => (
                    <div key={video.id} className="aspect-video bg-[#111111] border border-white/10 overflow-hidden">
                      {video.platform === 'youtube' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.video_url.split('v=')[1]?.split('&')[0]}`}
                          title={video.title}
                          className="w-full h-full grayscale active:grayscale-0 focus:grayscale-0"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video src={video.video_url} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Quick Actions / Contact */}
            <div className="sticky top-12 space-y-8">
              
              <div className="bg-purple-600 p-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Connect</h3>
                <div className="space-y-6">
                  {college.contact_email && (
                    <div className="block group">
                      <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Email</p>
                      <p className="text-xl font-bold tracking-tighter break-all">{college.contact_email}</p>
                    </div>
                  )}
                  {college.website_url && (
                    <a 
                      href={college.website_url.startsWith('http') ? college.website_url : `https://${college.website_url}`}
                      target="_blank" 
                      className="block group border-t border-white/20 pt-6"
                    >
                      <p className="text-white/60 text-[10px] uppercase font-bold mb-1">Official Website</p>
                      <p className="text-xl font-bold tracking-tighter group-hover:underline underline-offset-4 flex items-center gap-2">
                        Visit Site <span className="text-xs">↗</span>
                      </p>
                    </a>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-white/10 p-8 space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Details</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Established', value: college.created_at ? new Date(college.created_at).getFullYear() : 'N/A' },
                    { label: 'Focus', value: college.specialization },
                    { label: 'Affiliation', value: college.universities?.name },
                    { label: 'Phone', value: college.contact_phone }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 border-b border-white/5 pb-4">
                      <span className="text-[10px] uppercase font-bold text-white/30 mt-1">{item.label}</span>
                      <span className="text-sm font-bold text-right">{item.value || '—'}</span>
                    </div>
                  ))}
                </div>

                {college.brochure_url && (
                  <a
                    href={college.brochure_url}
                    className="w-full block text-center py-4 border border-white text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Download Brochure
                  </a>
                )}
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}