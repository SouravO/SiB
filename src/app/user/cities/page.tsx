'use client';

import { useState, useEffect } from 'react';
import { getAllCities } from '@/app/actions/colleges';
import {
    MapPin,
    Search,
    ChevronRight,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function CitiesPage() {
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCities = async () => {
            const result = await getAllCities();
            if (result.success) {
                setCities(result.data || []);
            }
            setLoading(false);
        };
        fetchCities();
    }, []);

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (city.states?.name && city.states.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading all cities...</p>
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
                    <span className="text-sm font-medium text-gray-500">Explore Cities</span>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">All Cities</h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Discover institutions across {cities.length} vibrant locations.
                        </p>
                    </div>
                    
                    {/* Inline Search */}
                    <div className="relative w-full md:w-96">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by city or state..."
                            className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Cities Grid */}
            {filteredCities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                    {filteredCities.map((city) => (
                        <Link 
                            key={city.id}
                            href={`/user?cityId=${city.id}`}
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
                                    {city.states?.name || 'Destination'}
                                </p>
                                <h3 className="text-2xl font-bold mb-4">{city.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold bg-white/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    Explore <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Cities Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We couldn't find any locations matching "{searchQuery}". Try a different search term.
                    </p>
                </div>
            )}
        </div>
    );
}
