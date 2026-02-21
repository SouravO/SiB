'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getStates,
    getCitiesByState,
    getUniversitiesByCity,
    getAllColleges,
    getAllCities
} from '@/app/actions/colleges';
import { signOut } from './actions';
import CollegeDetail from '@/components/CollegeDetail';
import FloatingContactButtons from '@/components/FloatingContactButtons';
import BannerCarousel from '@/components/BannerCarousel';
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
    const [allCities, setAllCities] = useState<any[]>([]);
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

            // Fetch all cities for dashboard display
            const allCitiesResult = await getAllCities();
            if (allCitiesResult.success) setAllCities(allCitiesResult.data || []);

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

    const filteredAllCities = allCities.filter(city =>
        city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="h-[2px] w-64 bg-purple-200 overflow-hidden">
                <div className="h-full bg-purple-600 animate-progress-loading"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans">
            {/* Sidebar - Fixed Width */}
            <aside className="w-24 lg:w-72 border-r border-gray-200 bg-white flex flex-col py-8 hidden md:flex">
               <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="w-full aspect-[4/1] bg-gray-100 rounded-lg flex items-center justify-center p-2 lg:p-4">
                       <img src="/assets/logo.png" alt="logo" className='w-auto h-full object-contain scale-800'/>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-4 px-6 py-4 bg-purple-600 text-white font-bold uppercase tracking-widest text-[10px]">
                        <LayoutDashboard size={18} />
                        <span className="hidden lg:block">Dashboard</span>
                    </button>
                    <form action={signOut} className="mt-4">
                        <button className="w-full flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all font-bold uppercase tracking-widest text-[10px]">
                            <LogOut size={18} />
                            <span className="hidden lg:block">Sign Out</span>
                        </button>
                    </form>
                </nav>

                <div className="p-8 border-t border-gray-200 hidden lg:block">
                    <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Member Access</p>
                    <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">

                {/* HIGH VISIBILITY SEARCH SECTION */}
                <header className="bg-white border-b border-gray-200 p-8 lg:px-12 z-20 shadow-lg">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Filter size={14} className="text-purple-500" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-900">Refine Discovery</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                            {/* State Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gray-100 transition-opacity ${selectedState ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className="relative border border-gray-300 group-focus-within:border-gray-900 p-4 transition-all">
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">01. Select State</label>

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
                                            className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-gray-900 text-xs outline-none focus:border-gray-400 placeholder:text-gray-400"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>

                                    {/* Selected State Display */}
                                    {selectedState && !showStateList && (
                                        <div className="mt-2 flex items-center justify-between bg-gray-100 rounded px-2 py-1.5">
                                            <span className="text-gray-900 text-sm font-medium">
                                                {states.find(s => s.id === selectedState)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedState('');
                                                    setStateSearchQuery('');
                                                    handleStateChange('');
                                                }}
                                                className="text-gray-500 hover:text-gray-900 transition-colors"
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
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedState === s.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-gray-400 text-xs">
                                                    No states found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* City Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-gray-100 transition-opacity ${selectedCity ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className={`relative border p-4 transition-all ${!selectedState ? 'border-gray-200 opacity-30' : 'border-gray-300 group-focus-within:border-gray-900'}`}>
                                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">02. Select City</label>

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
                                            className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-gray-900 text-xs outline-none focus:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>

                                    {/* Selected City Display */}
                                    {selectedCity && !showCityList && (
                                        <div className="mt-2 flex items-center justify-between bg-gray-100 rounded px-2 py-1.5">
                                            <span className="text-gray-900 text-sm font-medium">
                                                {cities.find(c => c.id === selectedCity)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCity('');
                                                    setCitySearchQuery('');
                                                }}
                                                className="text-gray-500 hover:text-gray-900 transition-colors"
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
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedCity === c.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-gray-400 text-xs">
                                                    {loadingCities ? 'Loading cities...' : 'No cities found'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* University Selector */}
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-purple-100/50 transition-opacity ${selectedUniversity ? 'opacity-100' : 'opacity-0'}`}></div>
                                <div className={`relative border p-4 transition-all ${!selectedCity ? 'border-gray-200 opacity-30' : 'border-purple-300 group-focus-within:border-purple-500'}`}>
                                    <label className="block text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-2">03. University Board</label>

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
                                            className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-gray-900 text-xs outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                                        />
                                        <Search size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>

                                    {/* Selected University Display */}
                                    {selectedUniversity && !showUniversityList && (
                                        <div className="mt-2 flex items-center justify-between bg-purple-100 border border-purple-200 rounded px-2 py-1.5">
                                            <span className="text-gray-900 text-sm font-medium">
                                                {universities.find(u => u.id === selectedUniversity)?.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUniversity('');
                                                    setUniversitySearchQuery('');
                                                }}
                                                className="text-gray-500 hover:text-gray-900 transition-colors"
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
                                                        className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${selectedUniversity === u.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                                    >
                                                        {u.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-2 py-3 text-center text-gray-400 text-xs">
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

                <>
                    {/* CITIES GRID SECTION - Show when no city selected */}
                    {!selectedCity && (
                        <section className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                            <div className="max-w-7xl mx-auto">
                            <BannerCarousel />
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-light tracking-tighter text-gray-900 mb-2">Explore Cities</h1>
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                        {filteredAllCities.length} Cities Available
                                    </p>
                                </div>
                            </div>

                            {/* City Search Bar */}
                            <div className="mb-8">
                                <div className="relative max-w-2xl">
                                    <input
                                        type="text"
                                        value={citySearchQuery}
                                        onChange={(e) => {
                                            setCitySearchQuery(e.target.value);
                                            setShowCityList(true);
                                        }}
                                        onFocus={() => setShowCityList(true)}
                                        placeholder="Search cities..."
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 pl-11 text-gray-900 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-400 transition-all shadow-sm"
                                    />
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    {citySearchQuery && (
                                        <button
                                            onClick={() => setCitySearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {allCities.length === 0 ? (
                                <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 border border-gray-200 flex items-center justify-center mb-8 bg-gray-50">
                                        <MapPin className="text-gray-400" size={30} />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-2">Loading Cities</h3>
                                    <p className="text-xs text-gray-600 max-w-xs font-light">Please wait while we fetch the available cities.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                                    {filteredAllCities.map((city) => (
                                        <div
                                            key={city.id}
                                            onClick={() => handleCityChange(city.id)}
                                            className="group bg-white border border-gray-200 hover:border-purple-500/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col shadow-sm hover:shadow-md"
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-40 bg-gray-100 overflow-hidden">
                                                {city.image_url ? (
                                                    <img
                                                        src={city.image_url}
                                                        alt={city.name}
                                                        className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <MapPin className="text-gray-300" size={30} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-80"></div>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h4 className="text-base font-bold uppercase tracking-wider text-gray-900 group-hover:text-purple-600 transition-colors">
                                                        {city.name}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-4 flex-1 flex flex-col border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[8px] font-bold text-gray-500 uppercase border border-gray-300 px-2 py-0.5">
                                                        {city.states?.name || 'Select to explore'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4 font-light italic">
                                                    Discover institutions in {city.name}
                                                </p>

                                                <div className="mt-auto flex justify-between items-center">
                                                    <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Select City
                                                    </span>
                                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                    {/* LISTING SECTION */}
                    {selectedCity && (
                        <section className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                        <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-light tracking-tighter text-gray-900 mb-2">The Collection</h1>
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
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
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 pl-11 text-gray-900 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 placeholder:text-gray-400 transition-all shadow-sm"
                                />
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                {collegeSearchQuery && (
                                    <button
                                        onClick={() => setCollegeSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {loadingColleges ? (
                            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Processing Index</p>
                            </div>
                        ) : filteredColleges.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                                {filteredColleges.map((college) => (
                                    <div
                                        key={college.id}
                                        onClick={() => setSelectedCollegeId(college.id)}
                                        className="group bg-white border border-gray-200 hover:border-purple-500 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col shadow-sm hover:shadow-md"
                                    >
                                        {/* Image Container */}
                                        <div className="relative h-56 bg-gray-100 overflow-hidden">
                                            {college.image_url ? (
                                                <img
                                                    src={college.image_url}
                                                    alt={college.name}
                                                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                    <GraduationCap className="text-gray-300" size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent opacity-60"></div>
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                                    {college.name}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 flex-1 flex flex-col border-t border-gray-100">
                                            {college.specialization && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[9px] font-bold text-purple-600 uppercase border border-purple-200 px-2 py-0.5">
                                                        {college.specialization}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-6 font-light italic">
                                                "{college.short_description || "A premier institution for advanced studies."}"
                                            </p>

                                            <div className="mt-auto flex justify-between items-center">
                                                <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Details
                                                </span>
                                                <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[50vh] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 border border-gray-200 flex items-center justify-center mb-8 bg-gray-50">
                                    {collegeSearchQuery ? <X className="text-gray-400" size={30} /> : <Search className="text-gray-400" size={30} />}
                                </div>
                                {collegeSearchQuery ? (
                                    <>
                                        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-2">No Matching Results</h3>
                                        <p className="text-xs text-gray-600 max-w-xs font-light">
                                            No colleges found for "{collegeSearchQuery}". Try adjusting your search or filters.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-2">No Universities Found</h3>
                                        <p className="text-xs text-gray-600 max-w-xs font-light">Please select a university to view colleges.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>
                    )}
                </>

                {/* College Detail Overlay */}
                {selectedCollegeId && (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12">
                        <div className="relative w-full max-w-6xl h-full bg-white border border-gray-200 flex flex-col shadow-2xl">
                            <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 bg-purple-500"></div>
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-900">Full Institution Dossier</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedCollegeId(null)}
                                    className="p-3 border border-gray-300 hover:border-gray-400 transition-all text-gray-600 bg-white hover:bg-gray-100 hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating Contact Buttons */}
            <FloatingContactButtons
                whatsappNumber="919876543210"
                phoneNumber="919876543210"
            />

            <style jsx global>{`
                @keyframes progress-loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-loading {
                    animation: progress-loading 1.5s infinite linear;
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #f3f4f6; }
                ::-webkit-scrollbar-thumb { background: #d1d5db; }
                ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

                select option {
                    background: #fff;
                    color: #111827;
                    padding: 20px;
                }
            `}</style>
        </div>
    );
}