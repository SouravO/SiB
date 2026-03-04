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
    const [searchQuery, setSearchQuery] = useState('');
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
        city.name.toLowerCase().includes(citySearchQuery.toLowerCase()) &&
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        city.states?.name?.toLowerCase() === 'karnataka'
    );

    // Show states filtered by search
    const filteredStatesForDisplay = states.filter(state =>
        state.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredInstitutions = allColleges.filter(college =>
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.specialization && college.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-10">
            {/* Welcome Section */}
            <section className="px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1 sm:mb-2">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'Explorer'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Find your dream institution today.</p>
            </section>

            <BannerCarousel />

            {/* Total Search Bar */}
            <div className="relative max-w-2xl mx-auto -mt-6 sm:-mt-10 z-10 px-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-6 py-4 sm:py-5 bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] shadow-xl shadow-purple-100/20 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 outline-none transition-all text-sm sm:text-base text-gray-900 font-medium placeholder:text-gray-400"
                        placeholder="Search for cities, states or institutions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Section */}
            {!selectedCity ? (
                <>
                {/* Show cities when state is selected */}
                {selectedState && cities.length > 0 ? (
                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedState('')}
                                    className="text-purple-600 font-bold text-xs sm:text-sm flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-all border border-purple-100 sm:border-transparent"
                                >
                                    Back
                                </button>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Cities in {states.find(s => s.id === selectedState)?.name}</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {cities.filter(city =>
                                city.name.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((city) => (
                                <div
                                    key={city.id}
                                    onClick={() => handleCityChange(city.id)}
                                    className="group relative h-64 sm:h-72 rounded-2xl sm:rounded-[2rem] overflow-hidden cursor-pointer bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 border border-gray-100"
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
                                                <MapPin size={40} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 text-white">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">
                                            {city.states?.name || 'Explore Now'}
                                        </p>
                                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{city.name}</h3>
                                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold bg-white/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            Explore <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <>
                    {/* Explore with Cities (Karnataka only) */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Explore with Cities</h2>
                            <Link
                                href="/user/cities"
                                className="text-purple-600 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline underline-offset-4 transition-all"
                            >
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {filteredAllCities.slice(0, 8).map((city) => (
                                <div
                                    key={city.id}
                                    onClick={() => handleCityChange(city.id)}
                                    className="group relative h-40 sm:h-48 rounded-2xl sm:rounded-[2rem] overflow-hidden cursor-pointer bg-white shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 border border-gray-100"
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
                                                <MapPin size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 text-white">
                                        <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-0.5 sm:mb-1">
                                            {city.states?.name || 'Karnataka'}
                                        </p>
                                        <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{city.name}</h3>
                                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold bg-white/20 backdrop-blur-md w-fit px-2.5 py-1 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            Explore <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredAllCities.length === 0 && (
                                <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-2xl sm:rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-sm">No cities found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* States Section */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Explore by State</h2>
                            <Link
                                href="/user/cities"
                                className="text-purple-600 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline underline-offset-4 transition-all"
                            >
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                     {filteredStatesForDisplay.map((state) => (
                 <div
                 key={state.id}
                 onClick={() => handleStateChange(state.id)}
                  className="group relative h-56 sm:h-64 rounded-2xl sm:rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-900 shadow-2xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02]"
               >
            {/* Animated Gradient Border Overlay */}
            <div className="absolute inset-0 p-[2px] rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-purple-500 via-magenta-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="absolute inset-[2px] bg-slate-900 rounded-[1.4rem] sm:rounded-[2.4rem] overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-[80px] group-hover:bg-purple-600/40 transition-colors" />
                
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/5 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                    <MapPin size={20} className="text-purple-400 sm:w-6 sm:h-6" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-purple-400/80">
                        Region
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">{state.name}</h3>
                    
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold mt-4 sm:mt-6 opacity-100 sm:opacity-0 group-hover:opacity-100 translate-y-0 sm:translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            EXPLORE CITIES
                        </span>
                        <ChevronRight size={14} className="text-blue-400 sm:w-4 sm:h-4" />
                    </div>
                </div>
            </div>
        </div>
    ))}
    {filteredStatesForDisplay.length === 0 && (
        <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-2xl sm:rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-sm">No states found matching your search.</p>
        </div>
    )}
</div>
                    </section>
                    </>
                )}

                <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Explore Institutions</h2>
                        <Link
                            href="/user/colleges"
                            className="text-purple-600 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer hover:underline underline-offset-4 transition-all"
                        >
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredInstitutions.slice(0, 6).map((college) => (
                            <div 
                                key={college.id}
                                onClick={() => setSelectedCollegeId(college.id)}
                                className="group bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                            >
                                <div className="relative h-48 sm:h-60 overflow-hidden">
                                    {college.image_url ? (
                                        <img 
                                            src={college.image_url} 
                                            alt={college.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-200">
                                            <School size={40} />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-purple-600 transition-colors line-clamp-2">
                                        {college.name}
                                    </h3>
                                    
                                    <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Compass size={12} className="sm:w-3.5 sm:h-3.5" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400">View Dossier</span>
                                        </div>
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                            <ChevronRight size={16} className="sm:w-4.5 sm:h-4.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredInstitutions.length === 0 && (
                            <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-2xl sm:rounded-[2.5rem] border border-dashed border-gray-200">
                                <p className="text-sm">No institutions found matching your search.</p>
                            </div>
                        )}
                    </div>
                </section>
                </>

                 ) : (
                <section className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 px-1">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <button 
                                    onClick={() => setSelectedCity('')}
                                    className="text-purple-600 font-bold text-xs sm:text-sm flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-all border border-purple-100 sm:border-transparent"
                                >
                                    Back
                                </button>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-500 text-xs sm:text-sm font-medium">Results for {cities.find(c => c.id === selectedCity)?.name}</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">The Collection</h2>
                            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">
                                {filteredColleges.length} Verified Institutions Found
                            </p>
                        </div>
                    </div>

                    {loadingColleges ? (
                        <div className="h-64 sm:h-96 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 animate-spin mb-4" />
                            <p className="text-sm sm:text-base text-gray-500 font-medium">Curating the best options for you...</p>
                        </div>
                    ) : filteredColleges.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-10 sm:pb-20">
                            {filteredColleges.map((college) => (
                                <div 
                                    key={college.id}
                                    onClick={() => setSelectedCollegeId(college.id)}
                                    className="group bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                                >
                                    <div className="relative h-48 sm:h-60 overflow-hidden">
                                        {college.image_url ? (
                                            <img 
                                                src={college.image_url} 
                                                alt={college.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-200">
                                                <School size={40} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-purple-600 transition-colors line-clamp-2">
                                            {college.name}
                                        </h3>
                                        
                                        <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <Compass size={12} className="sm:w-3.5 sm:h-3.5" />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className="text-[9px] sm:text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                                        {college.specialization || 'General'}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs font-bold text-gray-400">View Dossier</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <ChevronRight size={16} className="sm:w-4.5 sm:h-4.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 sm:py-20 text-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={28} className="text-gray-300 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                            <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto">
                                We couldn't find any institutions matching your search in this location. Try adjusting your filters.
                            </p>
                        </div>
                    )}
                </section>
                 )}

            {/* College Detail Overlay */}
            {selectedCollegeId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-8">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedCollegeId(null)}></div>
                    <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-5 sm:p-8 border-b border-gray-50 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg sm:rounded-xl flex items-center justify-center text-purple-600">
                                    <Compass size={16} className="sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Institution Dossier</h2>
                                    <p className="text-[9px] sm:text-xs text-gray-400 font-medium tracking-wide uppercase">Verified Profile</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCollegeId(null)}
                                className="p-2 sm:p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl sm:rounded-2xl transition-all hover:rotate-90 duration-300"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
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
