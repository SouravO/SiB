'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getStates,
    getCitiesByState,
    getUniversitiesByCity,
    getAllColleges
} from '@/app/actions/colleges';
import { signOut } from './actions';
import CollegeDetail from '@/components/CollegeDetail';
import {
    LogOut,
    MapPin,
    School,
    GraduationCap,
    ChevronRight,
    Search,
    LayoutDashboard,
    Loader2,
    X,
    Filter
} from 'lucide-react';

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);
    const [colleges, setColleges] = useState<any[]>([]);
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedUniversity, setSelectedUniversity] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingUniversities, setLoadingUniversities] = useState(false);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [showCityList, setShowCityList] = useState(false);
    const [stateSearchQuery, setStateSearchQuery] = useState('');
    const [showStateList, setShowStateList] = useState(false);
    const [universitySearchQuery, setUniversitySearchQuery] = useState('');
    const [showUniversityList, setShowUniversityList] = useState(false);
    const [collegeSearchQuery, setCollegeSearchQuery] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) window.location.href = '/login';

            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            setUser(user);
            setProfile(profileData);

            const statesResult = await getStates();
            if (statesResult.success) setStates(statesResult.data || []);
            setLoading(false);
        };
        fetchUserData();
    }, []);

    const handleStateChange = async (stateId: string) => {
        setSelectedState(stateId);
        setSelectedCity('');
        setSelectedUniversity('');
        setCities([]);
        setCitySearchQuery('');
        setShowCityList(false);
        setShowStateList(false);
        if (stateId) {
            setLoadingCities(true);
            const citiesResult = await getCitiesByState(stateId);
            if (citiesResult.success) setCities(citiesResult.data || []);
            setLoadingCities(false);
        }
    };

    const handleCityChange = async (cityId: string) => {
        setSelectedCity(cityId);
        setCitySearchQuery('');
        setSelectedUniversity('');
        setUniversitySearchQuery('');
        setShowUniversityList(false);
        setShowCityList(false);
        if (cityId) {
            setLoadingUniversities(true);
            const universitiesResult = await getUniversitiesByCity(cityId);
            if (universitiesResult.success) setUniversities(universitiesResult.data || []);
            setLoadingUniversities(false);
        }
    };

    // Filter states, cities, universities based on search query
    const filteredStates = states.filter(state =>
        state.name.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
    );

    const filteredUniversities = universities.filter(university =>
        university.name.toLowerCase().includes(universitySearchQuery.toLowerCase())
    );

    const handleUniversityChange = async (universityId: string) => {
        setSelectedUniversity(universityId);
        if (universityId) {
            setLoadingColleges(true);
            const collegesResult = await getAllColleges();
            if (collegesResult.success) {
                const filtered = (collegesResult.data || []).filter(
                    (c: any) => c.university_id === universityId
                );
                setColleges(filtered);
            }
            setLoadingColleges(false);
        }
    };

    // Filter colleges based on search query
    const filteredColleges = colleges.filter(college =>
        college.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
        (college.specialization && college.specialization.toLowerCase().includes(collegeSearchQuery.toLowerCase())) ||
        (college.short_description && college.short_description.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center">
            <div className="h-[2px] w-64 bg-purple-950 overflow-hidden">
                <div className="h-full bg-white animate-progress-loading"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            {/* Sidebar - Fixed Width */}
            <aside className="w-24 lg:w-72 border-r border-white/10 bg-[#080808] flex flex-col py-8 hidden md:flex">
                <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="w-full aspect-[4/1] bg-white rounded-lg flex items-center justify-center p-2 lg:p-4">
                       <img src="/assets/logo.png" alt="logo" className='w-auto h-full object-contain'/>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-4 px-6 py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px]">
                        <LayoutDashboard size={18} />
                        <span className="hidden lg:block">Dashboard</span>
                    </button>
                    <form action={signOut} className="mt-4">
                        <button className="w-full flex items-center gap-4 px-6 py-4 text-zinc-500 hover:text-white hover:bg-white/5 transition-all font-bold uppercase tracking-widest text-[10px]">
                            <LogOut size={18} />
                            <span className="hidden lg:block">Sign Out</span>
                        </button>
                    </form>
                </nav>
                
                <div className="p-8 border-t border-white/5 hidden lg:block">
                    <p className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">Member Access</p>
                    <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
                
                {/* HIGH VISIBILITY SEARCH SECTION */}
                <header className="bg-black border-b border-white/10 p-8 lg:px-12 z-20 shadow-2xl shadow-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Filter size={14} className="text-purple-500" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Refine Discovery</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                            {/* State Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-white/5 transition-opacity ${selectedState ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className="relative border border-white/20 group-focus-within:border-white p-4 transition-all">
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">01. Select State</label>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={stateSearchQuery}
                                            onChange={(e) => {
                                                setStateSearchQuery(e.target.value);
                                                setShowStateList(true);
                                            }}
                                            onFocus={() => setShowStateList(true)}
                                            placeholder="Search state..."
                                            className="w-full bg-zinc-900/50 border border-white/10 rounded px-3 py-1.5 text-white text-xs outline-none focus:border-white/30 placeholder:text-zinc-700"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    </div>

                                    {/* Selected State Display */}
                                    {selectedState && !showStateList && (
                                        <div className="mt-2 flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                                            <span className="text-white text-sm font-medium">
                                                {states.find(s => s.id === selectedState)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedState('');
                                                    setStateSearchQuery('');
                                                    handleStateChange('');
                                                }}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* State List - Only shown when typing */}
                                    {showStateList && (
                                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                            {filteredStates.length > 0 ? (
                                                filteredStates.map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleStateChange(s.id);
                                                            setShowStateList(false);
                                                        }}
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedState === s.id ? 'bg-white/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-zinc-600 text-xs">
                                                    No states found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* City Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-white/5 transition-opacity ${selectedCity ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className={`relative border p-4 transition-all ${!selectedState ? 'border-white/5 opacity-30' : 'border-white/20 group-focus-within:border-white'}`}>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">02. Select City</label>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={citySearchQuery}
                                            onChange={(e) => {
                                                setCitySearchQuery(e.target.value);
                                                setShowCityList(true);
                                            }}
                                            onFocus={() => setShowCityList(true)}
                                            disabled={!selectedState}
                                            placeholder="Search city..."
                                            className="w-full bg-zinc-900/50 border border-white/10 rounded px-3 py-1.5 text-white text-xs outline-none focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-700"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    </div>

                                    {/* Selected City Display */}
                                    {selectedCity && !showCityList && (
                                        <div className="mt-2 flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                                            <span className="text-white text-sm font-medium">
                                                {cities.find(c => c.id === selectedCity)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCity('');
                                                    setCitySearchQuery('');
                                                }}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* City List - Only shown when typing */}
                                    {showCityList && (
                                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                            {filteredCities.length > 0 ? (
                                                filteredCities.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleCityChange(c.id);
                                                            setShowCityList(false);
                                                        }}
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedCity === c.id ? 'bg-white/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-zinc-600 text-xs">
                                                    {loadingCities ? 'Loading cities...' : 'No cities found'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* University Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-purple-500/5 transition-opacity ${selectedUniversity ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className={`relative border p-4 transition-all ${!selectedCity ? 'border-white/5 opacity-30' : 'border-purple-500/40 group-focus-within:border-purple-500'}`}>
                                    <label className="block text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-2">03. University Board</label>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={universitySearchQuery}
                                            onChange={(e) => {
                                                setUniversitySearchQuery(e.target.value);
                                                setShowUniversityList(true);
                                            }}
                                            onFocus={() => setShowUniversityList(true)}
                                            disabled={!selectedCity}
                                            placeholder="Search university..."
                                            className="w-full bg-zinc-900/50 border border-white/10 rounded px-3 py-1.5 text-white text-xs outline-none focus:border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-700"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                    </div>

                                    {/* Selected University Display */}
                                    {selectedUniversity && !showUniversityList && (
                                        <div className="mt-2 flex items-center justify-between bg-purple-500/20 border border-purple-500/30 rounded px-2 py-1.5">
                                            <span className="text-white text-sm font-medium">
                                                {universities.find(u => u.id === selectedUniversity)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUniversity('');
                                                    setUniversitySearchQuery('');
                                                }}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* University List - Only shown when typing */}
                                    {showUniversityList && (
                                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                            {filteredUniversities.length > 0 ? (
                                                filteredUniversities.map(u => (
                                                    <button
                                                        key={u.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleUniversityChange(u.id);
                                                            setShowUniversityList(false);
                                                        }}
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedUniversity === u.id ? 'bg-purple-500/30 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                                    >
                                                        {u.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-zinc-600 text-xs">
                                                    {loadingUniversities ? 'Loading universities...' : 'No universities found'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* LISTING SECTION */}
                <section className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-light tracking-tighter text-white mb-2">The Collection</h1>
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                    {filteredColleges.length} Verified Institutions
                                </p>
                            </div>
                        </div>

                        {/* Common Search Bar */}
                        <div className="mb-8">
                            <div className="relative max-w-2xl">
                                <input
                                    type="text"
                                    value={collegeSearchQuery}
                                    onChange={(e) => setCollegeSearchQuery(e.target.value)}
                                    placeholder="Search colleges by name, specialization, or description..."
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 pl-11 text-white text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-zinc-600 transition-all"
                                />
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                {collegeSearchQuery && (
                                    <button
                                        onClick={() => setCollegeSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {loadingColleges ? (
                            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Processing Index</p>
                            </div>
                        ) : filteredColleges.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                                {filteredColleges.map((college) => (
                                    <div
                                        key={college.id}
                                        onClick={() => setSelectedCollegeId(college.id)}
                                        className="group bg-black border border-white/5 hover:border-white transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-56 bg-zinc-900 overflow-hidden">
                                            {college.image_url ? (
                                                <img 
                                                    src={college.image_url} 
                                                    alt={college.name} 
                                                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                                                    <GraduationCap className="text-zinc-800" size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-1 group-hover:text-purple-400 transition-colors">
                                                    {college.name}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 flex-1 flex flex-col border-t border-white/5">
                                            {college.specialization && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[9px] font-bold text-purple-500 uppercase border border-purple-500/30 px-2 py-0.5">
                                                        {college.specialization}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-6 font-light italic">
                                                "{college.short_description || "A premier institution for advanced studies."}"
                                            </p>
                                            
                                            <div className="mt-auto flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Details
                                                </span>
                                                <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 border border-white/5 flex items-center justify-center mb-8">
                                    {collegeSearchQuery ? <X className="text-zinc-800" size={30} /> : <Search className="text-zinc-800" size={30} />}
                                </div>
                                {collegeSearchQuery ? (
                                    <>
                                        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-500 mb-2">No Matching Results</h3>
                                        <p className="text-xs text-zinc-700 max-w-xs font-light">
                                            No colleges found for "{collegeSearchQuery}". Try adjusting your search or filters.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-500 mb-2">No Parameters Set</h3>
                                        <p className="text-xs text-zinc-700 max-w-xs font-light">Please select a state and city above to unlock the institutional database.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* College Detail Overlay */}
                {selectedCollegeId && (
                    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12">
                        <div className="relative w-full max-w-6xl h-full bg-black border border-white/10 flex flex-col shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                            <div className="flex justify-between items-center p-8 border-b border-white/5 bg-[#050505]">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 bg-purple-500"></div>
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-white">Full Institution Dossier</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedCollegeId(null)} 
                                    className="p-3 border border-white/10 hover:border-white transition-all text-white bg-black hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes progress-loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-loading {
                    animation: progress-loading 1.5s infinite linear;
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #000; }
                ::-webkit-scrollbar-thumb { background: #1a1a1a; }
                ::-webkit-scrollbar-thumb:hover { background: #333; }
                
                select option {
                    background: #000;
                    color: #fff;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
}