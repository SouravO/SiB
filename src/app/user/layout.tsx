'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from './actions';
import {
    getStates,
    getAllCities,
    getAllUniversities,
    getAllColleges
} from '@/app/actions/colleges';
import {
    LogOut,
    GraduationCap,
    LayoutDashboard,
    Compass,
    Settings,
    Bell,
    Search,
    MapPin,
    School,
    ChevronRight,
    X,
    Loader2,
    Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CollegeDetail from '@/components/CollegeDetail';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState({
        cities: [] as any[],
        universities: [] as any[],
        colleges: [] as any[]
    });
    const [data, setData] = useState({
        cities: [] as any[],
        universities: [] as any[],
        colleges: [] as any[]
    });
    const searchRef = useRef<HTMLDivElement>(null);

    // For college detail overlay in layout if needed
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

    // Close sidebar on path change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            setUser(user);
            setProfile(profileData);
            setLoading(false);

            // Prefetch search data
            const [citiesRes, univRes, collegesRes] = await Promise.all([
                getAllCities(),
                getAllUniversities(),
                getAllColleges()
            ]);

            setData({
                cities: citiesRes.success ? citiesRes.data || [] : [],
                universities: univRes.success ? univRes.data || [] : [],
                colleges: collegesRes.success ? collegesRes.data || [] : []
            });
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults({ cities: [], universities: [], colleges: [] });
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const query = searchQuery.toLowerCase();
        
        const filteredCities = data.cities.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.states?.name?.toLowerCase().includes(query)
        ).slice(0, 5);

        const filteredUnivs = data.universities.filter(u => 
            u.name.toLowerCase().includes(query) || 
            u.cities?.name?.toLowerCase().includes(query)
        ).slice(0, 5);

        const filteredColleges = data.colleges.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.specialization?.toLowerCase().includes(query) ||
            c.universities?.name?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults({
            cities: filteredCities,
            universities: filteredUnivs,
            colleges: filteredColleges
        });
        setIsSearching(false);
    }, [searchQuery, data]);

    // Handle clicks outside of search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Preparing your experience...</p>
        </div>
    );

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/user' },
        { label: 'Explore Cities', icon: Compass, href: '/user/cities' },
    ];

    const hasResults = searchResults.cities.length > 0 || 
                       searchResults.universities.length > 0 || 
                       searchResults.colleges.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans relative overflow-x-hidden">
            {/* Mobile Sidebar Toggle - Side Button */}
            {/* {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed left-0 top-0 -translate-y-1/2 z-[45] lg:hidden bg-purple-600 text-white p-3 rounded-r-2xl shadow-2xl shadow-purple-600/20 flex items-center justify-center transition-all hover:pl-5 group active:scale-95 animate-in slide-in-from-left duration-500"
                >
                    <Menu size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            )} */}

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50 transition-all duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 mb-8 flex items-center justify-between">
                    <div className="w-full aspect-[4/1] bg-gray-100 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                       <img src="/assets/logo.png" alt="logo" className='w-auto h-full object-contain scale-[4.5]'/>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.label}
                                href={item.href}
                                className={`w-full flex items-center gap-4 px-6 py-4 transition-all group ${
                                    isActive 
                                    ? 'bg-purple-600 text-white font-bold uppercase tracking-widest text-[10px]' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-bold uppercase tracking-widest text-[10px]'
                                }`}
                            >
                                <Icon size={18} className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">Member Access</p>
                            <p className="text-sm font-medium truncate text-gray-800">{profile?.full_name || 'Student'}</p>
                        </div>
                    </div>
                    <form action={signOut}>
                        <button className="w-full flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all font-bold uppercase tracking-widest text-[10px]">
                            <LogOut size={18} />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 transition-all duration-300 flex flex-col min-h-screen bg-gray-50 w-full">
                {/* Header / Top Bar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 relative" ref={searchRef}>
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl lg:hidden shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="relative w-full max-w-2xl">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search..."
                                className="w-full bg-gray-100 border-none rounded-2xl py-2.5 pl-12 pr-10 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowResults(true);
                                }}
                                onFocus={() => setShowResults(true)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-all"
                                >
                                    <X size={14} className="text-gray-500" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchQuery.trim() && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto z-50">
                                {isSearching ? (
                                    <div className="p-8 text-center">
                                        <Loader2 size={24} className="animate-spin text-purple-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">Searching...</p>
                                    </div>
                                ) : hasResults ? (
                                    <div className="p-2">
                                        {/* Cities Section */}
                                        {searchResults.cities.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Cities</h3>
                                                {searchResults.cities.map(city => (
                                                    <button
                                                        key={city.id}
                                                        onClick={() => {
                                                            router.push(`/user?cityId=${city.id}`);
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-2xl transition-all group text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                                                            <MapPin size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800">{city.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{city.states?.name}</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Universities Section */}
                                        {searchResults.universities.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Boards / Universities</h3>
                                                {searchResults.universities.map(univ => (
                                                    <button
                                                        key={univ.id}
                                                        onClick={() => {
                                                            router.push(`/user?cityId=${univ.city_id}`);
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-2xl transition-all group text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                                                            <Compass size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800">{univ.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{univ.cities?.name}, {univ.cities?.states?.name}</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Colleges Section */}
                                        {searchResults.colleges.length > 0 && (
                                            <div>
                                                <h3 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Institutions</h3>
                                                {searchResults.colleges.map(college => (
                                                    <button
                                                        key={college.id}
                                                        onClick={() => {
                                                            setSelectedCollegeId(college.id);
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-2xl transition-all group text-left"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                                                            <School size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800">{college.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{college.specialization || 'General'} • {college.universities?.name}</p>
                                                        </div>
                                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-base font-bold text-gray-900 mb-1">No matches found</p>
                                        <p className="text-sm text-gray-500">We couldn't find anything matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-6">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse"></div>
                            Live
                        </div>
                        <button className="p-2 sm:p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 w-full">
                    {children}
                </main>

                {/* Footer */}
                <footer className="px-6 sm:px-10 py-12 border-t border-gray-200 mt-auto bg-white w-full">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-32 aspect-[4/1] bg-gray-100 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                                <img src="/assets/logo.png" alt="logo" className='w-auto h-full object-contain scale-[2]'/>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm font-medium text-gray-400">
                            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-purple-600 transition-colors">Help Center</a>
                        </div>
                        <p className="text-xs text-gray-400 font-medium text-center">© 2026 SiB International. All rights reserved.</p>
                    </div>
                </footer>
            </div>

            {/* College Detail Overlay - accessible from anywhere via global search */}
            {selectedCollegeId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedCollegeId(null)}></div>
                    <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-50 sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Compass size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Institution Dossier</h2>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Verified Profile</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedCollegeId(null)}
                                className="p-2 sm:p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl sm:rounded-2xl transition-all hover:rotate-90 duration-300"
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

            <style jsx global>{`
                .animate-in {
                    animation-duration: 300ms;
                    animation-fill-mode: both;
                }
                .fade-in {
                    animation-name: fadeIn;
                }
                .slide-in-from-top-2 {
                    animation-name: slideInFromTop;
                }
                .zoom-in-95 {
                    animation-name: zoomIn;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInFromTop {
                    from { transform: translateY(-0.5rem); }
                    to { transform: translateY(0); }
                }
                @keyframes zoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
