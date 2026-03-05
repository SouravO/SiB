'use client';

import { useState, useEffect } from 'react';
import {
    getAllUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getAllCities,
    type City
} from '@/app/actions/colleges';
import { X, Upload, Edit, Trash2, Check, Loader2, Plus, Landmark } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface UniversityManagementClientProps {
    initialUniversities: any[];
    showAddModal?: boolean;
    onAddModalClose?: () => void;
}

export default function UniversityManagementClient({ initialUniversities, showAddModal: externalShowAddModal, onAddModalClose }: UniversityManagementClientProps) {
    const [universities, setUniversities] = useState<any[]>(initialUniversities);
    const [cities, setCities] = useState<City[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { success: showSuccess, error: showError } = useToast();

    // Sync with external modal control
    useEffect(() => {
        if (externalShowAddModal) {
            setShowAddModal(true);
            onAddModalClose?.();
        }
    }, [externalShowAddModal, onAddModalClose]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // 3x3 grid

    // Add University Form
    const [newUniversityName, setNewUniversityName] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Pagination calculations
    const totalPages = Math.ceil(universities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUniversities = universities.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToPreviousPage = () => {
        setCurrentPage(Math.max(1, currentPage - 1));
    };

    const goToNextPage = () => {
        setCurrentPage(Math.min(totalPages, currentPage + 1));
    };

    const loadCities = async () => {
        const result = await getAllCities();
        if (result.success && result.data) setCities(result.data);
    };

    const loadUniversities = async () => {
        const result = await getAllUniversities();
        if (result.success && result.data) {
            setUniversities(result.data);
            setCurrentPage(1); // Reset to first page after refresh
        }
    };

    const handleOpenAddModal = async () => {
        await loadCities();
        setShowAddModal(true);
        setNewUniversityName('');
        setSelectedCity('');
    };

    const handleAddUniversity = async () => {
        if (!newUniversityName.trim()) {
            showError('University name is required', 'Validation Error');
            return;
        }
        if (!selectedCity) {
            showError('Please select a city', 'Validation Error');
            return;
        }

        // Validate university name length
        if (newUniversityName.trim().length < 2) {
            showError('University name must be at least 2 characters', 'Validation Error');
            return;
        }

        setIsLoading(true);
        console.log('[UniversityManagementClient] Creating university:', {
            name: newUniversityName.trim(),
            cityId: selectedCity,
        });

        try {
            const result = await createUniversity(newUniversityName.trim(), selectedCity);

            console.log('[UniversityManagementClient] Create result:', result);

            if (result.success && result.data) {
                showSuccess('University created successfully', 'University Created');
                await loadUniversities();
                setShowAddModal(false);
                setNewUniversityName('');
                setSelectedCity('');
            } else {
                console.error('[UniversityManagementClient] Creation failed:', result.error);
                showError(result.error || 'Failed to create university', 'Creation Failed');
            }
        } catch (err) {
            console.error('[UniversityManagementClient] Error creating university:', err);
            showError('An error occurred while creating the university. Check browser console for details.', 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditModal = async (university: any) => {
        await loadCities();
        setEditingUniversity(university);
        setNewUniversityName(university.name);
        setSelectedCity(university.city_id);
        setShowEditModal(true);
    };

    const handleUpdateUniversity = async () => {
        if (!newUniversityName.trim()) {
            showError('University name is required', 'Validation Error');
            return;
        }

        if (newUniversityName.trim().length < 2) {
            showError('University name must be at least 2 characters', 'Validation Error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateUniversity(editingUniversity.id, {
                name: newUniversityName.trim(),
                city_id: selectedCity
            });

            if (result.success && result.data) {
                showSuccess('University updated successfully', 'University Updated');
                await loadUniversities();
                setShowEditModal(false);
                setEditingUniversity(null);
                setNewUniversityName('');
                setSelectedCity('');
            } else {
                showError(result.error || 'Failed to update university', 'Update Failed');
            }
        } catch (err) {
            console.error('Error updating university:', err);
            showError('An error occurred while updating the university', 'Error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUniversity = async (universityId: string, universityName: string) => {
        if (!confirm(`Are you sure you want to delete the university "${universityName}"? This action cannot be undone.`)) return;

        const result = await deleteUniversity(universityId);
        if (result.success) {
            showSuccess('University deleted successfully', 'University Deleted');
            await loadUniversities();
        } else {
            showError(result.error || 'Failed to delete university', 'Error');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-light text-gray-900">University Management</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage universities and their images</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-md"
                >
                    <Plus size={14} />
                    Add University
                </button>
            </div>

            {/* Universities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedUniversities.map((university) => (
                    <div
                        key={university.id}
                        className="group bg-white border border-gray-200 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md"
                    >
                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                                        {university.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Landmark size={12} />
                                        City: {university.cities?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEditModal(university)}
                                        className="p-2 bg-white/90 hover:bg-purple-500 rounded-full transition-colors shadow-md"
                                    >
                                        <Edit size={14} className="text-gray-900" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUniversity(university.id, university.name)}
                                        className="p-2 bg-white/90 hover:bg-red-500 rounded-full transition-colors shadow-md"
                                    >
                                        <Trash2 size={14} className="text-gray-900" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                    currentPage === page
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-500 hover:bg-purple-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Page Info */}
            {universities.length > 0 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                    Showing {startIndex + 1}-{Math.min(endIndex, universities.length)} of {universities.length} universities
                </p>
            )}

            {universities.length === 0 && (
                <div className="text-center py-20">
                    <Landmark className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-sm text-gray-500">No universities found. Add your first university.</p>
                </div>
            )}

            {/* Add University Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-light text-gray-900">Add New University</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* University Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    University Name
                                </label>
                                <input
                                    type="text"
                                    value={newUniversityName}
                                    onChange={(e) => setNewUniversityName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-purple-500/50"
                                    placeholder="Enter university name"
                                />
                            </div>

                            {/* City Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    City
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-purple-500/50"
                                >
                                    <option value="">Select a city</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleAddUniversity}
                                disabled={isLoading}
                                className="w-full py-3 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Creating...' : 'Create University'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit University Modal */}
            {showEditModal && editingUniversity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-light text-gray-900">Edit University</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* University Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    University Name
                                </label>
                                <input
                                    type="text"
                                    value={newUniversityName}
                                    onChange={(e) => setNewUniversityName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-purple-500/50"
                                />
                            </div>

                            {/* City Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    City
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm outline-none focus:border-purple-500/50"
                                >
                                    <option value="">Select a city</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleUpdateUniversity}
                                disabled={isLoading}
                                className="w-full py-3 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Updating...' : 'Update University'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
