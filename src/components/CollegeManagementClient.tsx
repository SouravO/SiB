'use client';

import { useState, useEffect } from 'react';
import AddCollegeModal from './AddCollegeModal';
import { deleteCollege, createUniversity, getAllUniversities, deleteUniversity } from '@/app/actions/colleges';
import CollegeDetail from './CollegeDetail';
import { X } from 'lucide-react';

interface College {
    id: string;
    name: string;
    slug: string;
    specialization?: string;
    short_description?: string;
    contact_email?: string;
    contact_phone?: string;
    created_at: string;
    universities?: {
        name: string;
        cities?: {
            name: string;
            states?: {
                name: string;
            };
        };
    };
}

interface CollegeManagementClientProps {
    initialColleges: College[];
}

export default function CollegeManagementClient({ initialColleges }: CollegeManagementClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [colleges, setColleges] = useState(initialColleges);
    const [deletingCollegeId, setDeletingCollegeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'colleges' | 'states' | 'cities' | 'universities'>('colleges');

    // University management state
    const [universities, setUniversities] = useState<any[]>([]);
    const [loadingUniversities, setLoadingUniversities] = useState(true);
    const [showAddUniversityModal, setShowAddUniversityModal] = useState(false);
    const [newUniversityName, setNewUniversityName] = useState('');
    const [universityError, setUniversityError] = useState('');
    const [deletingUniversityId, setDeletingUniversityId] = useState<string | null>(null);
    const [universitySearchTerm, setUniversitySearchTerm] = useState('');
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);


    const handleSuccess = () => {
        // Refresh the page to get updated college list
        window.location.reload();
    };

    // Load universities when the universities tab is active
    useEffect(() => {
        if (activeTab === 'universities') {
            loadUniversities();
        }
    }, [activeTab]);

    const loadUniversities = async () => {
        setLoadingUniversities(true);
        const result = await getAllUniversities();
        if (result.success) {
            setUniversities(result.data || []);
        }
        setLoadingUniversities(false);
    };

    const handleAddUniversity = async () => {
        if (!newUniversityName.trim()) {
            setUniversityError('University name is required');
            return;
        }

        // In a real implementation, you would need to select a city for the university
        // For now, we'll show an error since we don't have city selection in this view
        setUniversityError('Please add universities through the college creation form where you can select the city');
        return;
    };

    const handleDeleteUniversity = async (universityId: string, universityName: string) => {
        if (!confirm(`Are you sure you want to delete "${universityName}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingUniversityId(universityId);
        const result = await deleteUniversity(universityId);

        if (result.success) {
            setUniversities(universities.filter(u => u.id !== universityId));
        } else {
            alert(`Failed to delete university: ${result.error}`);
        }
        setDeletingUniversityId(null);
    };

    const handleDeleteCollege = async (collegeId: string, collegeName: string) => {
        if (!confirm(`Are you sure you want to delete "${collegeName}"? This will also delete all associated images, videos, and documents. This action cannot be undone.`)) {
            return;
        }

        setDeletingCollegeId(collegeId);
        const result = await deleteCollege(collegeId);

        if (result.success) {
            setColleges(colleges.filter(c => c.id !== collegeId));
        } else {
            alert(`Failed to delete college: ${result.error}`);
        }
        setDeletingCollegeId(null);
    };

    const filteredColleges = colleges.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.universities?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
                    <button
                        onClick={() => setActiveTab('colleges')}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeTab === 'colleges'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        Colleges
                    </button>
                    <button
                        onClick={() => setActiveTab('states')}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeTab === 'states'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        States
                    </button>
                    <button
                        onClick={() => setActiveTab('cities')}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeTab === 'cities'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        Cities
                    </button>
                    <button
                        onClick={() => setActiveTab('universities')}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeTab === 'universities'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        Universities
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'colleges' && (
                    <>
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">College Management</h2>
                                <p className="text-slate-400 text-sm mt-1">Add, edit, and manage colleges</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New College
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search colleges by name, specialization, or university..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* College List */}
                        <div className="space-y-3">
                            {filteredColleges.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-slate-400">
                                        {searchTerm ? 'No colleges found matching your search' : 'No colleges added yet'}
                                    </p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="mt-4 px-6 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded-lg hover:bg-purple-600/30 transition"
                                        >
                                            Add Your First College
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredColleges.map((college) => (
                                    <div
                                        key={college.id}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition gap-4"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                                <h3 className="text-white font-semibold text-lg">{college.name}</h3>
                                                {college.specialization && (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                                                        {college.specialization}
                                                    </span>
                                                )}
                                            </div>

                                            {college.universities && (
                                                <p className="text-sm text-slate-400 mb-1">
                                                    🏛️ {college.universities.name}
                                                    {college.universities.cities && (
                                                        <>
                                                            {' • '}📍 {college.universities.cities.name}
                                                            {college.universities.cities.states && (
                                                                <>, {college.universities.cities.states.name}</>
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            )}

                                            {college.short_description && (
                                                <p className="text-sm text-slate-500 mt-2">{college.short_description}</p>
                                            )}

                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                {college.contact_email && (
                                                    <span>✉️ {college.contact_email}</span>
                                                )}
                                                {college.contact_phone && (
                                                    <span>📞 {college.contact_phone}</span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 mt-2">
                                                Added: {new Date(college.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedCollegeId(college.id)}
                                                className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg hover:bg-blue-600/30 transition"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCollege(college.id, college.name)}
                                                disabled={deletingCollegeId === college.id}
                                                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingCollegeId === college.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* College Details Modal - moved outside the college list div */}
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
                        

                        {/* Stats */}
                        {colleges.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <p className="text-sm text-slate-400">
                                    Showing {filteredColleges.length} of {colleges.length} college{colleges.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'states' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">State Management</h2>
                                <p className="text-slate-400 text-sm mt-1">Manage states</p>
                            </div>
                        </div>
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-slate-400">State management coming soon</p>
                        </div>
                    </div>
                )}

                {activeTab === 'cities' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">City Management</h2>
                                <p className="text-slate-400 text-sm mt-1">Manage cities</p>
                            </div>
                        </div>
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-slate-400">City management coming soon</p>
                        </div>
                    </div>
                )}

                {activeTab === 'universities' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">University Management</h2>
                                <p className="text-slate-400 text-sm mt-1">Manage universities</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={universitySearchTerm}
                                onChange={(e) => setUniversitySearchTerm(e.target.value)}
                                placeholder="Search universities..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* University List */}
                        <div className="space-y-3">
                            {loadingUniversities ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                                    <p className="text-slate-400 mt-2">Loading universities...</p>
                                </div>
                            ) : universities.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14l9 5 9-5M3 19l9 5 9-5M3 9l9 5 9-5M3 4l9 5 9-5" />
                                    </svg>
                                    <p className="text-slate-400">No universities added yet</p>
                                </div>
                            ) : (
                                universities.map((university) => (
                                    <div
                                        key={university.id}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition gap-4"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                                <h3 className="text-white font-semibold text-lg">{university.name}</h3>
                                            </div>

                                            {university.cities && (
                                                <p className="text-sm text-slate-400 mb-1">
                                                    📍 {university.cities.name}
                                                    {university.cities.states && (
                                                        <>, {university.cities.states.name}</>
                                                    )}
                                                </p>
                                            )}

                                            <p className="text-xs text-slate-600 mt-2">
                                                Added: {new Date(university.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => window.open(`/universities/${university.slug}`, '_blank')}
                                                className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg hover:bg-blue-600/30 transition"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUniversity(university.id, university.name)}
                                                disabled={deletingUniversityId === university.id}
                                                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingUniversityId === university.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AddCollegeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}
