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
    Globe,
    X
} from 'lucide-react';

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [universities, setUniversities] = useState<any[]>([]);
    const [colleges, setColleges] = useState<Array<{
        id: string;
        name: string;
        slug: string;
        university_id: string;
        specialization?: string;
        short_description?: string;
        contact_email?: string;
        contact_phone?: string;
        created_at: string;
        image_url?: string;
        universities?: {
            name: string;
            cities?: {
                name: string;
                states?: {
                    name: string;
                };
            };
        };
    }>>([]);
    const [selectedState, setSelectedState] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedUniversity, setSelectedUniversity] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingUniversities, setLoadingUniversities] = useState(false);
    const [loadingColleges, setLoadingColleges] = useState(false);
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

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
        if (stateId) {
            setLoadingCities(true);
            const citiesResult = await getCitiesByState(stateId);
            if (citiesResult.success) setCities(citiesResult.data || []);
            setLoadingCities(false);
        }
    };

    const handleCityChange = async (cityId: string) => {
        setSelectedCity(cityId);
        setSelectedUniversity('');
        if (cityId) {
            setLoadingUniversities(true);
            const universitiesResult = await getUniversitiesByCity(cityId);
            if (universitiesResult.success) setUniversities(universitiesResult.data || []);
            setLoadingUniversities(false);
        }
    };

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

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Initializing Experience</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex">
            {/* Sidebar Navigation */}
            <aside className="w-72 border-r border-white/5 bg-[#020617]/50 backdrop-blur-xl flex flex-col p-6 hidden lg:flex">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Study in Karnataka<span className="text-indigo-500">.</span></span>
                </div>

                <nav className="space-y-2 flex-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 transition-all">
                        <LayoutDashboard size={20} className="text-indigo-400" />
                        <span className="font-medium">Explorer</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                        <Search size={20} />
                        <span className="font-medium">Advanced Search</span>
                    </button>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                            <span className="text-indigo-400 font-bold uppercase">{profile?.full_name?.charAt(0) || user?.email?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <form action={signOut}>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                            <LogOut size={18} />
                            <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 px-8 py-6 bg-[#020617]/80 backdrop-blur-md border-bottom border-white/5 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-white">Discovery Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800" />)}
                            <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-indigo-500 flex items-center justify-center text-[10px] font-bold">+12</div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Active Students</span>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {/* Hero Welcome */}
                    <div className="relative mb-12 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/20 to-transparent border border-white/5">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'}!</h2>
                            <p className="text-slate-400 max-w-xl">Your personalized journey to the perfect education starts here. Select a location to begin filtering top-tier institutions.</p>
                        </div>
                        <Globe className="absolute -right-10 -bottom-10 w-64 h-64 text-indigo-500/5 rotate-12" />
                    </div>

                    {/* Selection Steps */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Filters */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">1</div>
                                    <h3 className="font-semibold text-white">Location Filter</h3>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-400 transition-colors">Select State</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <select 
                                                value={selectedState}
                                                onChange={(e) => handleStateChange(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            >
                                                <option value="">All States</option>
                                                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-400 transition-colors">Select City</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <select 
                                                value={selectedCity}
                                                onChange={(e) => handleCityChange(e.target.value)}
                                                disabled={!selectedState}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <option value="">{loadingCities ? 'Loading...' : 'Choose City'}</option>
                                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">2</div>
                                    <h3 className="font-semibold text-white">University Affiliation</h3>
                                </div>
                                <div className="relative">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select 
                                        value={selectedUniversity}
                                        onChange={(e) => handleUniversityChange(e.target.value)}
                                        disabled={!selectedCity}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white appearance-none focus:ring-2 focus:ring-violet-500/50 outline-none transition-all disabled:opacity-30"
                                    >
                                        <option value="">{loadingUniversities ? 'Fetching Universities...' : 'Choose University'}</option>
                                        {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* College Results */}
                        <div className="lg:col-span-8">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Available Colleges</h3>
                                        <p className="text-sm text-slate-500">{colleges.length} matches found</p>
                                    </div>
                                    <div className="px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                        Step 3: Results
                                    </div>
                                </div>

                                {loadingColleges ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="text-slate-500 text-sm">Curating the best options...</p>
                                    </div>
                                ) : colleges.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {colleges.map((college) => (
                                            <div
                                                key={college.id}
                                                onClick={() => setSelectedCollegeId(college.id)}
                                                className="group relative bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.07] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden"
                                            >
                                                {/* College Image */}
                                                {college.image_url ? (
                                                    <div className="relative h-40 overflow-hidden">
                                                        <img
                                                            src={college.image_url}
                                                            alt={college.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <h4 className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">{college.name}</h4>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xl border border-white/5">
                                                                {college.name.charAt(0)}
                                                            </div>
                                                            <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                                                        </div>
                                                        <h4 className="text-white font-bold mb-1 group-hover:text-indigo-300 transition-colors">{college.name}</h4>
                                                    </div>
                                                )}

                                                {/* College Info */}
                                                <div className="p-4 pt-2">
                                                    {college.specialization && (
                                                        <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase tracking-tighter mb-2">
                                                            {college.specialization}
                                                        </span>
                                                    )}
                                                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                                        {college.short_description || "Explore this institution's unique curriculum and campus life."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <Search className="text-slate-600 w-10 h-10" />
                                        </div>
                                        <h4 className="text-white font-semibold mb-2">No Results Yet</h4>
                                        <p className="text-slate-500 text-sm max-w-xs">Select a state, city, and university on the left to discover educational opportunities.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* College Detail Overlay */}
                {selectedCollegeId && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#020617] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">College Details</h2>
                                <button
                                    onClick={() => setSelectedCollegeId(null)}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}