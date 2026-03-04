'use client';

import { useState, useEffect } from 'react';
import { getAllColleges } from '@/app/actions/colleges';
import CollegeDetail from '@/components/CollegeDetail';
import {
    School,
    Search,
    ChevronRight,
    Loader2,
    ArrowLeft,
    Compass,
    X
} from 'lucide-react';
import Link from 'next/link';

export default function CollegesPage() {
    const [colleges, setColleges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

    useEffect(() => {
        const fetchColleges = async () => {
            const result = await getAllColleges();
            if (result.success) {
                setColleges(result.data || []);
            }
            setLoading(false);
        };
        fetchColleges();
    }, []);

    const filteredColleges = colleges.filter(college =>
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.specialization && college.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (college.universities?.cities?.name && college.universities.cities.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading institutions...</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumbs & Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link 
                        href="/user" 
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-purple-600"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-medium text-gray-500">Explore Institutions</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Institutions</h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Browse through {colleges.length} verified academic institutions.
                        </p>
                    </div>
                    
                    {/* Inline Search */}
                    <div className="relative w-full md:w-96">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, course or city..."
                            className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Colleges Grid */}
            {filteredColleges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredColleges.map((college) => (
                        <div 
                            key={college.id}
                            onClick={() => setSelectedCollegeId(college.id)}
                            className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                        >
                            <div className="relative h-60 overflow-hidden">
                                {college.image_url ? (
                                    <img 
                                        src={college.image_url} 
                                        alt={college.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-200">
                                        <School size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                                 
                                </div>
                            </div>
                            
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                                    {college.name}
                                </h3>
                                
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between flex-col">
                                  
                                  
                                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.15em]">
    {Array.isArray(college.specialization) 
        ? college.specialization.join(', ') 
        : (college.specialization || 'General')}
</span>
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Compass size={14} />
                                        </div>
                                        <div className="flex items-center gap-2 group-hover:gap-4 transition-all">

                                        <span className="text-xs font-bold text-gray-400">
                                            {college.universities?.cities?.name || 'View Dossier'}
                                        </span>
                                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                        <ChevronRight size={18} />
                                        </div>

                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <School size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We couldn't find any institutions matching "{searchQuery}".
                    </p>
                </div>
            )}

            {/* College Detail Overlay */}
            {selectedCollegeId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedCollegeId(null)}></div>
                    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-8 border-b border-gray-50 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Compass size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Institution Dossier</h2>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Verified Profile</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCollegeId(null)}
                                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all hover:rotate-90 duration-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
