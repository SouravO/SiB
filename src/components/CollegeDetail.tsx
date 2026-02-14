'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCollegeById } from '@/app/actions/colleges';

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

interface CollegeDetailProps {
  collegeId: string;
  showHeader?: boolean;
}

export default function CollegeDetail({ collegeId, showHeader = true }: CollegeDetailProps) {
  const [college, setCollege] = useState<any>(null);
  const [images, setImages] = useState<CollegeImage[]>([]);
  const [videos, setVideos] = useState<CollegeVideo[]>([]);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-slate-400">Loading college details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading College</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 max-w-md">
          <svg className="w-16 h-16 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">College Not Found</h3>
          <p className="text-slate-400">The requested college could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header - only show if showHeader prop is true */}
        {showHeader && (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {college.name}
              </h1>
              <p className="text-slate-400 mt-2">
                {college.specialization ? `${college.specialization} • ` : ''}
                {college.universities?.name ? `${college.universities.name} • ` : ''}
                {college.universities?.cities?.name ? `${college.universities.cities.name}, ` : ''}
                {college.universities?.cities?.states?.name ? `${college.universities.cities.states.name}` : ''}
              </p>
            </div>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200"
            >
              Back to Search
            </button>
          </div>
        )}
        {!showHeader && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {college.name}
            </h1>
            <p className="text-slate-400 mt-2">
              {college.specialization ? `${college.specialization} • ` : ''}
              {college.universities?.name ? `${college.universities.name} • ` : ''}
              {college.universities?.cities?.name ? `${college.universities.cities.name}, ` : ''}
              {college.universities?.cities?.states?.name ? `${college.universities.cities.states.name}` : ''}
            </p>
          </div>
        )}

        {/* College Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">About</h2>

              {college.long_description ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {college.long_description}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic">No detailed description available.</p>
              )}
            </div>

            {/* Images Section */}
            {images.length > 0 && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Campus Photos</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'College photo'}
                        className="w-full h-64 object-cover"
                      />
                      {image.caption && (
                        <p className="text-slate-400 text-sm mt-2 px-2 py-1">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>

                <div className="grid grid-cols-1 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                      {video.platform === 'youtube' ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.video_url.split('v=')[1]?.split('&')[0]}`}
                          title={video.title || 'College Video'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : video.platform === 'vimeo' ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${video.video_url.split('/').pop()}`}
                          title={video.title || 'College Video'}
                          className="w-full h-full"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <video
                          src={video.video_url}
                          controls
                          className="w-full h-full object-contain"
                          title={video.title || 'College Video'}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      {video.title && (
                        <p className="text-slate-400 text-sm mt-2 px-2 py-1">{video.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            {(college.contact_email || college.contact_phone || college.website_url) && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>

                <div className="space-y-4">
                  {college.contact_email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Email</p>
                        <p className="text-white">{college.contact_email}</p>
                      </div>
                    </div>
                  )}

                  {college.contact_phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Phone</p>
                        <p className="text-white">{college.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {college.website_url && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Website</p>
                        <a
                          href={college.website_url.startsWith('http') ? college.website_url : `https://${college.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Additional Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Established</p>
                  <p className="text-white">
                    {college.created_at ? new Date(college.created_at).getFullYear() : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Specialization</p>
                  <p className="text-white">
                    {college.specialization || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Affiliated To</p>
                  <p className="text-white">
                    {college.universities?.name || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="text-white">
                    {college.universities?.cities?.name ? `${college.universities.cities.name}, ` : ''}
                    {college.universities?.cities?.states?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Brochure */}
            {college.brochure_url && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Documents</h2>

                <a
                  href={college.brochure_url}
                  download={college.brochure_url.split('/').pop()?.includes('.') ? undefined : "brochure.pdf"}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-[1.02] transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Brochure
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}