'use client';

import { useState, useEffect } from 'react';
import AddCollegeModal from './AddCollegeModal';
import { deleteCollege, createUniversity, getAllUniversities, deleteUniversity } from '@/app/actions/colleges';
import CollegeDetail from './CollegeDetail';
import { X, Search, Plus, MapPin, Landmark, GraduationCap, Trash2, Eye, LayoutGrid, Globe } from 'lucide-react';

interface CollegeManagementClientProps {
    initialColleges: any[];
}

export default function CollegeManagementClient({ initialColleges }: CollegeManagementClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [colleges, setColleges] = useState(initialColleges);
    const [deletingCollegeId, setDeletingCollegeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'colleges' | 'states' | 'cities' | 'universities'>('colleges');

    const [universities, setUniversities] = useState<any[]>([]);
    const [loadingUniversities, setLoadingUniversities] = useState(true);
    const [deletingUniversityId, setDeletingUniversityId] = useState<string | null>(null);
    const [universitySearchTerm, setUniversitySearchTerm] = useState('');
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

    const handleSuccess = () => window.location.reload();

    useEffect(() => {
        if (activeTab === 'universities') loadUniversities();
    }, [activeTab]);

    const loadUniversities = async () => {
        setLoadingUniversities(true);
        const result = await getAllUniversities();
        if (result.success) setUniversities(result.data || []);
        setLoadingUniversities(false);
    };

    const handleDeleteUniversity = async (universityId: string, universityName: string) => {
        if (!confirm(`Are you sure you want to delete "${universityName}"?`)) return;
        setDeletingUniversityId(universityId);
        const result = await deleteUniversity(universityId);
        if (result.success) setUniversities(universities.filter(u => u.id !== universityId));
        else alert(`Failed: ${result.error}`);
        setDeletingUniversityId(null);
    };

    const handleDeleteCollege = async (collegeId: string, collegeName: string) => {
        if (!confirm(`Are you sure you want to delete "${collegeName}"?`)) return;
        setDeletingCollegeId(collegeId);
        const result = await deleteCollege(collegeId);
        if (result.success) setColleges(colleges.filter(c => c.id !== collegeId));
        else alert(`Failed: ${result.error}`);
        setDeletingCollegeId(null);
    };

    const filteredColleges = colleges.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.universities?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* KINETIC SIDEBAR NAVIGATION */}
                <nav className="lg:col-span-3 space-y-2">
                    <div className="mb-8 px-4">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent tracking-tighter">
                            CORE_ADMIN
                        </h1>
                        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mt-1">Institutional Control</p>
                    </div>
                    
                    {[
                        { id: 'colleges', label: 'Colleges', icon: GraduationCap },
                        { id: 'universities', label: 'Universities', icon: Landmark },
                        { id: 'cities', label: 'Cities', icon: MapPin },
                        { id: 'states', label: 'States', icon: Globe },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${
                                activeTab === tab.id 
                                ? 'bg-white/10 text-white border-l-4 border-purple-500 shadow-[20px_0_40px_-20px_rgba(168,85,247,0.2)]' 
                                : 'hover:bg-white/5 text-slate-500'
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-400' : 'group-hover:text-slate-300'}`} />
                            <span className="font-bold tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* MAIN CONTENT AREA */}
                <main className="lg:col-span-9 space-y-6">
                    
                    {/* SEARCH & ACTION BAR */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={activeTab === 'colleges' ? searchTerm : universitySearchTerm}
                                onChange={(e) => activeTab === 'colleges' ? setSearchTerm(e.target.value) : setUniversitySearchTerm(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/5 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                        {activeTab === 'colleges' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                ADD COLLEGE
                            </button>
                        )}
                    </div>

                    {/* CONTENT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTab === 'colleges' && (
                            filteredColleges.length > 0 ? (
                                filteredColleges.map((college) => (
                                    <div key={college.id} className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => setSelectedCollegeId(college.id)} className="p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                                            <button 
                                                onClick={() => handleDeleteCollege(college.id, college.name)}
                                                disabled={deletingCollegeId === college.id}
                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">{college.specialization || 'General'}</span>
                                            <h3 className="text-xl font-bold text-white mt-1 leading-tight group-hover:text-purple-400 transition-colors">{college.name}</h3>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Landmark className="w-4 h-4 text-slate-600" />
                                                <span className="truncate">{college.universities?.name || 'No University'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <MapPin className="w-4 h-4 text-slate-600" />
                                                <span>{college.universities?.cities?.name}, {college.universities?.cities?.states?.name}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-600">
                                            <span>UID: {college.id.split('-')[0]}</span>
                                            <span>{new Date(college.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                    <LayoutGrid className="w-12 h-12 mx-auto text-slate-800 mb-4" />
                                    <p className="text-slate-500 font-medium">No results found in the database.</p>
                                </div>
                            )
                        )}

                        {/* UNIVERSITIES TAB CONTENT */}
                        {activeTab === 'universities' && (
                            loadingUniversities ? (
                                <div className="col-span-full text-center py-20 animate-pulse text-purple-500 font-mono">LOADING_DATA...</div>
                            ) : universities.map((uni) => (
                                <div key={uni.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{uni.name}</h3>
                                        <p className="text-sm text-slate-500 uppercase tracking-tighter">{uni.cities?.name}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteUniversity(uni.id, uni.name)}
                                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}

                        {/* STATES/CITIES PLACEHOLDER */}
                        {(activeTab === 'states' || activeTab === 'cities') && (
                            <div className="col-span-full py-20 text-center bg-purple-500/5 rounded-3xl border border-purple-500/20">
                                <h3 className="text-purple-400 font-black text-2xl tracking-tighter">FEATURE_LOCKED</h3>
                                <p className="text-slate-500 text-sm mt-2 font-mono">Module integration pending next deployment cycle.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MODAL OVERLAY REDESIGN */}
            {selectedCollegeId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedCollegeId(null)} />
                    <div className="relative w-full max-w-5xl h-[85vh] bg-[#0A0A0A] rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-4 font-mono text-xs text-slate-500 uppercase tracking-widest">Inspector_Mode</span>
                            </div>
                            <button onClick={() => setSelectedCollegeId(null)} className="hover:rotate-90 transition-transform duration-300">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                        </div>
                    </div>
                </div>
            )}

            <AddCollegeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
        </div>
    );
}