'use client';

import { useState, useEffect } from 'react';
import AddCollegeModal from './AddCollegeModal';
import EditCollegeModal from './EditCollegeModal';
import CityManagementClient from './CityManagementClient';
import {
    deleteCollege,
    createUniversity,
    getAllUniversities,
    deleteUniversity,
    updateUniversity,
    getStates,
    createState,
    updateState,
    deleteState,
    getAllCities,
} from '@/app/actions/colleges';
import CollegeDetail from './CollegeDetail';
import {
    X, Search, Plus, MapPin, Landmark, GraduationCap, Trash2, Eye, LayoutGrid, Globe,
    Edit, Check, Loader2
} from 'lucide-react';

interface CollegeManagementClientProps {
    initialColleges: any[];
}

export default function CollegeManagementClient({ initialColleges }: CollegeManagementClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [colleges, setColleges] = useState(initialColleges);
    const [deletingCollegeId, setDeletingCollegeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'colleges' | 'states' | 'cities' | 'universities'>('colleges');

    // Universities
    const [universities, setUniversities] = useState<any[]>([]);
    const [loadingUniversities, setLoadingUniversities] = useState(true);
    const [deletingUniversityId, setDeletingUniversityId] = useState<string | null>(null);
    const [universitySearchTerm, setUniversitySearchTerm] = useState('');
    const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

    // Edit college
    const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null);

    // University editing
    const [editingUniversityId, setEditingUniversityId] = useState<string | null>(null);
    const [editUniversityName, setEditUniversityName] = useState('');
    const [savingUniversity, setSavingUniversity] = useState(false);

    // States
    const [states, setStates] = useState<any[]>([]);
    const [loadingStates, setLoadingStates] = useState(true);
    const [stateSearchTerm, setStateSearchTerm] = useState('');
    const [newStateName, setNewStateName] = useState('');
    const [addingState, setAddingState] = useState(false);
    const [editingStateId, setEditingStateId] = useState<string | null>(null);
    const [editStateName, setEditStateName] = useState('');
    const [savingState, setSavingState] = useState(false);
    const [deletingStateId, setDeletingStateId] = useState<string | null>(null);

    // Cities
    const [allCities, setAllCities] = useState<any[]>([]);
    const [loadingCities, setLoadingCities] = useState(true);

    const handleSuccess = () => window.location.reload();

    useEffect(() => {
        if (activeTab === 'universities') loadUniversities();
        if (activeTab === 'states') loadStates();
        if (activeTab === 'cities') loadCities();
    }, [activeTab]);

    const loadUniversities = async () => {
        setLoadingUniversities(true);
        const result = await getAllUniversities();
        if (result.success) setUniversities(result.data || []);
        setLoadingUniversities(false);
    };

    const loadStates = async () => {
        setLoadingStates(true);
        const result = await getStates();
        if (result.success) setStates(result.data || []);
        setLoadingStates(false);
    };

    const loadCities = async () => {
        setLoadingCities(true);
        const result = await getAllCities();
        if (result.success) setAllCities(result.data || []);
        setLoadingCities(false);
    };

    // ── University CRUD ──
    const handleDeleteUniversity = async (universityId: string, universityName: string) => {
        if (!confirm(`Are you sure you want to delete "${universityName}"?`)) return;
        setDeletingUniversityId(universityId);
        const result = await deleteUniversity(universityId);
        if (result.success) setUniversities(universities.filter(u => u.id !== universityId));
        else alert(`Failed: ${result.error}`);
        setDeletingUniversityId(null);
    };

    const handleStartEditUniversity = (uni: any) => {
        setEditingUniversityId(uni.id);
        setEditUniversityName(uni.name);
    };

    const handleSaveUniversity = async (universityId: string) => {
        if (!editUniversityName.trim()) return;
        setSavingUniversity(true);
        const result = await updateUniversity(universityId, { name: editUniversityName.trim() });
        if (result.success) {
            setUniversities(universities.map(u => u.id === universityId ? { ...u, name: editUniversityName.trim() } : u));
            setEditingUniversityId(null);
        } else {
            alert(`Failed: ${result.error}`);
        }
        setSavingUniversity(false);
    };

    // ── State CRUD ──
    const handleAddState = async () => {
        if (!newStateName.trim()) return;
        setAddingState(true);
        const result = await createState(newStateName.trim());
        if (result.success && result.data) {
            setStates([...states, result.data]);
            setNewStateName('');
        } else {
            alert(`Failed: ${result.error}`);
        }
        setAddingState(false);
    };

    const handleStartEditState = (state: any) => {
        setEditingStateId(state.id);
        setEditStateName(state.name);
    };

    const handleSaveState = async (stateId: string) => {
        if (!editStateName.trim()) return;
        setSavingState(true);
        const result = await updateState(stateId, { name: editStateName.trim() });
        if (result.success) {
            setStates(states.map(s => s.id === stateId ? { ...s, name: editStateName.trim() } : s));
            setEditingStateId(null);
        } else {
            alert(`Failed: ${result.error}`);
        }
        setSavingState(false);
    };

    const handleDeleteState = async (stateId: string, stateName: string) => {
        if (!confirm(`Are you sure you want to delete "${stateName}"? This will also delete all cities and universities under it.`)) return;
        setDeletingStateId(stateId);
        const result = await deleteState(stateId);
        if (result.success) setStates(states.filter(s => s.id !== stateId));
        else alert(`Failed: ${result.error}`);
        setDeletingStateId(null);
    };

    // ── College ──
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

    const filteredUniversities = universities.filter(uni =>
        uni.name.toLowerCase().includes(universitySearchTerm.toLowerCase()) ||
        uni.cities?.name?.toLowerCase().includes(universitySearchTerm.toLowerCase())
    );

    const filteredStates = states.filter(s =>
        s.name.toLowerCase().includes(stateSearchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* SIDEBAR NAVIGATION */}
                <nav className="lg:col-span-3 space-y-2">
                    <div className="mb-8 px-4">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tighter">
                            CORE_ADMIN
                        </h1>
                        <p className="text-xs font-mono text-gray-500 tracking-widest uppercase mt-1">Institutional Control</p>
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
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group ${activeTab === tab.id
                                    ? 'bg-white text-gray-900 border-l-4 border-purple-500 shadow-lg'
                                    : 'hover:bg-white/50 text-gray-500'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'group-hover:text-gray-700'}`} />
                            <span className="font-bold tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* MAIN CONTENT AREA */}
                <main className="lg:col-span-9 space-y-6">

                    {/* SEARCH & ACTION BAR */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="relative w-full md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={activeTab === 'colleges' ? searchTerm : activeTab === 'universities' ? universitySearchTerm : stateSearchTerm}
                                onChange={(e) => {
                                    if (activeTab === 'colleges') setSearchTerm(e.target.value);
                                    else if (activeTab === 'universities') setUniversitySearchTerm(e.target.value);
                                    else if (activeTab === 'states') setStateSearchTerm(e.target.value);
                                }}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                            />
                        </div>
                        {activeTab === 'colleges' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 active:scale-95 shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                ADD COLLEGE
                            </button>
                        )}
                    </div>

                    {/* CONTENT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* ═══ COLLEGES TAB ═══ */}
                        {activeTab === 'colleges' && (
                            filteredColleges.length > 0 ? (
                                filteredColleges.map((college) => (
                                    <div key={college.id} className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => setEditingCollegeId(college.id)} className="p-2 bg-purple-50 hover:bg-purple-500 text-purple-500 hover:text-white rounded-lg transition-all shadow-sm" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setSelectedCollegeId(college.id)} className="p-2 bg-gray-100 hover:bg-gray-900 text-gray-700 hover:text-white rounded-lg transition-all shadow-sm" title="View">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCollege(college.id, college.name)}
                                                disabled={deletingCollegeId === college.id}
                                                className="p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all shadow-sm" title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-[10px] font-mono text-purple-600 uppercase tracking-widest">{college.specialization || 'General'}</span>
                                            <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight group-hover:text-purple-600 transition-colors">{college.name}</h3>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Landmark className="w-4 h-4 text-gray-400" />
                                                <span className="truncate">{college.universities?.name || 'No University'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{college.universities?.cities?.name}, {college.universities?.cities?.states?.name}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-mono text-gray-400">
                                            <span>UID: {college.id.split('-')[0]}</span>
                                            <span>{new Date(college.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                                    <LayoutGrid className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No results found in the database.</p>
                                </div>
                            )
                        )}

                        {/* ═══ UNIVERSITIES TAB ═══ */}
                        {activeTab === 'universities' && (
                            loadingUniversities ? (
                                <div className="col-span-full text-center py-20 animate-pulse text-purple-500 font-mono">LOADING_DATA...</div>
                            ) : filteredUniversities.length > 0 ? (
                                filteredUniversities.map((uni) => (
                                    <div key={uni.id} className="bg-white border border-gray-200 p-6 rounded-2xl flex justify-between items-center shadow-sm group hover:border-purple-500/30 transition-all">
                                        <div className="flex-1 min-w-0">
                                            {editingUniversityId === uni.id ? (
                                                <input
                                                    type="text" value={editUniversityName} onChange={(e) => setEditUniversityName(e.target.value)}
                                                    className="w-full bg-gray-50 border border-purple-400 rounded-lg px-3 py-2 text-gray-900 text-lg font-bold outline-none focus:ring-2 focus:ring-purple-500/30"
                                                    autoFocus
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUniversity(uni.id); if (e.key === 'Escape') setEditingUniversityId(null); }}
                                                />
                                            ) : (
                                                <>
                                                    <h3 className="font-bold text-gray-900 text-lg">{uni.name}</h3>
                                                    <p className="text-sm text-gray-500 uppercase tracking-tighter">{uni.cities?.name}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {editingUniversityId === uni.id ? (
                                                <>
                                                    <button onClick={() => handleSaveUniversity(uni.id)} disabled={savingUniversity}
                                                        className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                                        {savingUniversity ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => setEditingUniversityId(null)}
                                                        className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleStartEditUniversity(uni)}
                                                        className="p-3 text-purple-500 hover:bg-purple-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteUniversity(uni.id, uni.name)}
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                                    <Landmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-medium">No universities found.</p>
                                </div>
                            )
                        )}

                        {/* ═══ STATES TAB ═══ */}
                        {activeTab === 'states' && (
                            loadingStates ? (
                                <div className="col-span-full text-center py-20 animate-pulse text-purple-500 font-mono">LOADING_DATA...</div>
                            ) : (
                                <>
                                    {/* Add new state */}
                                    <div className="col-span-full bg-white border border-gray-200 p-5 rounded-2xl shadow-sm mb-2">
                                        <div className="flex gap-3">
                                            <input
                                                type="text" value={newStateName} onChange={(e) => setNewStateName(e.target.value)}
                                                placeholder="Enter new state name..."
                                                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-purple-500 text-sm"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddState(); }}
                                            />
                                            <button onClick={handleAddState} disabled={addingState || !newStateName.trim()}
                                                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-500 transition-all disabled:opacity-30 text-xs uppercase tracking-wider flex items-center gap-2 shadow-md">
                                                {addingState ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Add State
                                            </button>
                                        </div>
                                    </div>

                                    {/* States list */}
                                    {filteredStates.map((state) => (
                                        <div key={state.id} className="bg-white border border-gray-200 p-6 rounded-2xl flex justify-between items-center shadow-sm group hover:border-purple-500/30 transition-all">
                                            <div className="flex-1 min-w-0">
                                                {editingStateId === state.id ? (
                                                    <input
                                                        type="text" value={editStateName} onChange={(e) => setEditStateName(e.target.value)}
                                                        className="w-full bg-gray-50 border border-purple-400 rounded-lg px-3 py-2 text-gray-900 text-lg font-bold outline-none focus:ring-2 focus:ring-purple-500/30"
                                                        autoFocus
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveState(state.id); if (e.key === 'Escape') setEditingStateId(null); }}
                                                    />
                                                ) : (
                                                    <h3 className="font-bold text-gray-900 text-lg">{state.name}</h3>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                {editingStateId === state.id ? (
                                                    <>
                                                        <button onClick={() => handleSaveState(state.id)} disabled={savingState}
                                                            className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all">
                                                            {savingState ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                        </button>
                                                        <button onClick={() => setEditingStateId(null)}
                                                            className="p-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleStartEditState(state)}
                                                            className="p-3 text-purple-500 hover:bg-purple-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteState(state.id, state.name)}
                                                            disabled={deletingStateId === state.id}
                                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            {deletingStateId === state.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredStates.length === 0 && (
                                        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                                            <Globe className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium">No states found.</p>
                                        </div>
                                    )}
                                </>
                            )
                        )}

                        {/* ═══ CITIES TAB ═══ */}
                        {activeTab === 'cities' && (
                            loadingCities ? (
                                <div className="col-span-full text-center py-20 animate-pulse text-purple-500 font-mono">LOADING_DATA...</div>
                            ) : (
                                <div className="col-span-full">
                                    <CityManagementClient initialCities={allCities} />
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>

            {/* VIEW DETAIL MODAL */}
            {selectedCollegeId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" onClick={() => setSelectedCollegeId(null)} />
                    <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl border border-gray-200 overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-4 font-mono text-xs text-gray-500 uppercase tracking-widest">Inspector_Mode</span>
                            </div>
                            <button onClick={() => setSelectedCollegeId(null)} className="hover:rotate-90 transition-transform duration-300">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <CollegeDetail collegeId={selectedCollegeId} showHeader={false} />
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT COLLEGE MODAL */}
            {editingCollegeId && (
                <EditCollegeModal
                    isOpen={!!editingCollegeId}
                    collegeId={editingCollegeId}
                    onClose={() => setEditingCollegeId(null)}
                    onSuccess={handleSuccess}
                />
            )}

            <AddCollegeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
        </div>
    );
}