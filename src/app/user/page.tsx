'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    getStates,
    getCitiesByState,
    getUniversitiesByCity,
    getAllColleges,
    getAllCities
} from '@/app/actions/colleges';
import CollegeDetail from '@/components/CollegeDetail';
import FloatingContactButtons from '@/components/FloatingContactButtons';
import BannerCarousel from '@/components/BannerCarousel';
import {
    MapPin,
    School,
    ChevronRight,
    Search,
    Loader2,
    X,
    ChevronDown,
    Compass
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function UserDashboard() {
    const searchParams = useSearchParams();
    const cityIdFromQuery = searchParams.get('cityId');
    
    const [profile, setProfile] = useState<any>(null);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [allCities, setAllCities] = useState<any[]>([]);
    const [allColleges, setAllColleges] = useState<any[]>([]);
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

    const handleCityChange = useCallback(async (cityId: string) => {
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
            
            setLoadingColleges(true);
            const collegesResult = await getAllColleges();
            if (collegesResult.success) {
                const cityUniversities = (await getUniversitiesByCity(cityId)).data || [];
                const cityUnivIds = cityUniversities.map((u: any) => u.id);
                const filtered = (collegesResult.data || []).filter(
                    (c: any) => cityUnivIds.includes(c.university_id)
                );
                setColleges(filtered);
            }
            setLoadingColleges(false);
        }
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

    const handleUniversityChange = async (universityId: string) => {
        setSelectedUniversity(universityId);
        setShowUniversityList(false);
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

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            setProfile(profileData);

            const statesResult = await getStates();
            if (statesResult.success) setStates(statesResult.data || []);

            const allCitiesResult = await getAllCities();
            if (allCitiesResult.success) setAllCities(allCitiesResult.data || []);

            const allCollegesResult = await getAllColleges();
            if (allCollegesResult.success) setAllColleges(allCollegesResult.data || []);

            // If cityId is in query, handle it
            if (cityIdFromQuery) {
                handleCityChange(cityIdFromQuery);
            }

            setLoading(false);
        };
        fetchUserData();
    }, [cityIdFromQuery, handleCityChange]);

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

    const filteredColleges = colleges.filter(college =>
        college.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
        (college.specialization && college.specialization.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            {/* Welcome Section */}
            <section>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'}! 👋
                </h1>
                <p className="text-gray-500 font-medium">Find your dream institution today.</p>
            </section>

            <BannerCarousel />

            {/* Unified Filter Bar */}
            <section className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* State Selection */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowStateList(!showStateList)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all ${selectedState ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <MapPin size={18} className={selectedState ? 'text-purple-600' : 'text-gray-400'} />
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">State</p>
                                    <p className="font-bold truncate">{states.find(s => s.id === selectedState)?.name || 'Select State'}</p>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${showStateList ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showStateList && (
                            <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-3xl shadow-2xl z-30 overflow-hidden">
                                <div className="p-4 border-b border-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            autoFocus
                                            placeholder="Search states..."
                                            className="w-full bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none"
                                            value={stateSearchQuery}
                                            onChange={(e) => setStateSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-2">
                                    {filteredStates.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleStateChange(s.id)}
                                            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${selectedState === s.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* City Selection */}
                    <div className="relative">
                        <button 
                            disabled={!selectedState}
                            onClick={() => setShowCityList(!showCityList)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all ${selectedCity ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <School size={18} className={selectedCity ? 'text-purple-600' : 'text-gray-400'} />
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">City</p>
                                    <p className="font-bold truncate">{cities.find(c => c.id === selectedCity)?.name || 'Select City'}</p>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${showCityList ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showCityList && (
                            <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-3xl shadow-2xl z-30 overflow-hidden">
                                <div className="p-4 border-b border-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            autoFocus
                                            placeholder="Search cities..."
                                            className="w-full bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none"
                                            value={citySearchQuery}
                                            onChange={(e) => setCitySearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-2">
                                    {filteredCities.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleCityChange(c.id)}
                                            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${selectedCity === c.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                    {loadingCities && <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading cities...</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* University Selection */}
                    <div className="relative">
                        <button 
                            disabled={!selectedCity}
                            onClick={() => setShowUniversityList(!showUniversityList)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-3xl transition-all ${selectedUniversity ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Compass size={18} className={selectedUniversity ? 'text-purple-600' : 'text-gray-400'} />
                                <div className="text-left min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Board</p>
                                    <p className="font-bold truncate">{universities.find(u => u.id === selectedUniversity)?.name || 'Select Board'}</p>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${showUniversityList ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showUniversityList && (
                            <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-3xl shadow-2xl z-30 overflow-hidden">
                                <div className="p-4 border-b border-gray-50">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            autoFocus
                                            placeholder="Search universities..."
                                            className="w-full bg-gray-50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none"
                                            value={universitySearchQuery}
                                            onChange={(e) => setUniversitySearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-2">
                                    {filteredUniversities.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleUniversityChange(u.id)}
                                            className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${selectedUniversity === u.id ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
                                        >
                                            {u.name}
                                        </button>
                                    ))}
                                    {loadingUniversities && <div className="p-4 text-center text-xs text-gray-400 animate-pulse">Loading universities...</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content Section */}
            {!selectedCity ? (
                <>
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Popular Cities</h2>
                        <Link 
                            href="/user/cities"
                            className="text-purple-600 text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline underline-offset-4 transition-all"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredAllCities.slice(0, 8).map((city) => (
                            <div 
                                key={city.id}
                                onClick={() => handleCityChange(city.id)}
                                className="group relative h-72 rounded-[2rem] overflow-hidden cursor-pointer bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                            >
                                <div className="absolute inset-0">
                                    {city.image_url ? (
                                        <img 
                                            src={city.image_url} 
                                            alt={city.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-200">
                                            <MapPin size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">
                                        {city.states?.name || 'Explore Now'}
                                    </p>
                                    <h3 className="text-2xl font-bold mb-4">{city.name}</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        Explore <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Explore Institutions</h2>
                        <Link 
                            href="/user/colleges"
                            className="text-purple-600 text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline underline-offset-4 transition-all"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allColleges.slice(0, 6).map((college) => (
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
                                        {/* <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                            {college.specialization || 'General'}
                                        </span> */}
                                    </div>
                                </div>
                                
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                                        {college.name}
                                    </h3>
                                    
                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Compass size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">View Dossier</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                </>
            ) : (
                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <button 
                                    onClick={() => setSelectedCity('')}
                                    className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:bg-purple-50 px-3 py-1 rounded-full transition-all"
                                >
                                    Back
                                </button>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-500 text-sm font-medium">Results for {cities.find(c => c.id === selectedCity)?.name}</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">The Collection</h2>
                            <p className="text-gray-500 font-medium mt-1">
                                {filteredColleges.length} Verified Institutions Found
                            </p>
                        </div>
                    </div>

                    {loadingColleges ? (
                        <div className="h-96 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Curating the best options for you...</p>
                        </div>
                    ) : filteredColleges.length > 0 ? (
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
                                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                                {college.specialization || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 group-hover:text-purple-600 transition-colors">
                                            {college.name}
                                        </h3>
                                        
                                        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <Compass size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400">View Dossier</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any institutions matching your search in this location. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </section>
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

            <FloatingContactButtons 
                whatsappNumber="919876543210"
                phoneNumber="919876543210"
            />
        </div>
    );
}
