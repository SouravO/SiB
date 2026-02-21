'use client';

import { useState } from 'react';
import {
    getAllCities,
    createCity,
    updateCity,
    uploadCityImage,
    deleteCityImage,
    getStates,
    type City,
    type State
} from '@/app/actions/colleges';
import { X, Upload, Edit, Trash2, Check, Image as ImageIcon, Loader2, Plus, MapPin } from 'lucide-react';

interface CityManagementClientProps {
    initialCities: any[];
}

export default function CityManagementClient({ initialCities }: CityManagementClientProps) {
    const [cities, setCities] = useState<any[]>(initialCities);
    const [states, setStates] = useState<State[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCity, setEditingCity] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Add City Form
    const [newCityName, setNewCityName] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [cityImage, setCityImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const loadStates = async () => {
        const result = await getStates();
        if (result.success && result.data) setStates(result.data);
    };

    const loadCities = async () => {
        const result = await getAllCities();
        if (result.success && result.data) setCities(result.data);
    };

    const handleOpenAddModal = async () => {
        await loadStates();
        setShowAddModal(true);
        setError('');
        setNewCityName('');
        setSelectedState('');
        setCityImage(null);
        setImagePreview(null);
    };

    const handleAddCity = async () => {
        if (!newCityName.trim()) {
            setError('City name is required');
            return;
        }
        if (!selectedState) {
            setError('Please select a state');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // First create the city
            const result = await createCity(newCityName.trim(), selectedState);

            if (result.success && result.data) {
                // If there's an image, upload it
                if (cityImage) {
                    console.log('Uploading city image for city:', result.data.id);
                    console.log('Image file:', cityImage.name, 'Size:', cityImage.size);

                    const uploadResult = await uploadCityImage(result.data.id, cityImage);

                    if (uploadResult.success) {
                        console.log('Image uploaded successfully:', uploadResult.data);
                    } else {
                        console.error('Failed to upload image:', uploadResult.error);
                        setError('City created but image upload failed: ' + uploadResult.error);
                    }
                }

                await loadCities();
                setShowAddModal(false);
                setNewCityName('');
                setSelectedState('');
                setCityImage(null);
                setImagePreview(null);
            } else {
                setError(result.error || 'Failed to create city');
            }
        } catch (err) {
            console.error('Error creating city:', err);
            setError('An error occurred while creating the city');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditModal = (city: any) => {
        setEditingCity(city);
        setNewCityName(city.name);
        setSelectedState(city.state_id);
        setImagePreview(city.image_url || null);
        setShowEditModal(true);
        setError('');
    };

    const handleUpdateCity = async () => {
        if (!newCityName.trim()) {
            setError('City name is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Update city name
            const result = await updateCity(editingCity.id, {
                name: newCityName.trim()
            });

            if (result.success && result.data) {
                // If there's a new image, upload it
                if (cityImage) {
                    console.log('Uploading city image for city:', editingCity.id);
                    const uploadResult = await uploadCityImage(editingCity.id, cityImage);

                    if (uploadResult.success) {
                        console.log('Image uploaded successfully:', uploadResult.data);
                    } else {
                        console.error('Failed to upload image:', uploadResult.error);
                        setError('City updated but image upload failed: ' + uploadResult.error);
                    }
                }

                await loadCities();
                setShowEditModal(false);
                setEditingCity(null);
                setNewCityName('');
                setCityImage(null);
                setImagePreview(null);
            } else {
                setError(result.error || 'Failed to update city');
            }
        } catch (err) {
            console.error('Error updating city:', err);
            setError('An error occurred while updating the city');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = async (cityId: string) => {
        if (!confirm('Are you sure you want to remove the city image?')) return;
        
        const result = await deleteCityImage(cityId);
        if (result.success) {
            await loadCities();
            if (editingCity) {
                setImagePreview(null);
            }
        } else {
            setError(result.error || 'Failed to delete image');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCityImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-light text-white">City Management</h3>
                    <p className="text-xs text-zinc-500 mt-1">Manage cities and their images</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                >
                    <Plus size={14} />
                    Add City
                </button>
            </div>

            {/* Cities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map((city) => (
                    <div
                        key={city.id}
                        className="group bg-[#0a0a0a] border border-white/5 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all"
                    >
                        {/* Image */}
                        <div className="relative h-40 bg-zinc-900">
                            {city.image_url ? (
                                <img
                                    src={city.image_url}
                                    alt={city.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <MapPin className="text-zinc-700" size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                            
                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenEditModal(city)}
                                    className="p-2 bg-black/80 hover:bg-purple-500 rounded-full transition-colors"
                                >
                                    <Edit size={14} className="text-white" />
                                </button>
                                {city.image_url && (
                                    <button
                                        onClick={() => handleDeleteImage(city.id)}
                                        className="p-2 bg-black/80 hover:bg-red-500 rounded-full transition-colors"
                                    >
                                        <Trash2 size={14} className="text-white" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                                {city.name}
                            </h4>
                            <p className="text-xs text-zinc-500">
                                State: {city.states?.name || 'N/A'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {cities.length === 0 && (
                <div className="text-center py-20">
                    <MapPin className="mx-auto text-zinc-700 mb-4" size={48} />
                    <p className="text-sm text-zinc-500">No cities found. Add your first city.</p>
                </div>
            )}

            {/* Add City Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-light text-white">Add New City</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* City Name */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    City Name
                                </label>
                                <input
                                    type="text"
                                    value={newCityName}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                                    placeholder="Enter city name"
                                />
                            </div>

                            {/* State Selector */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    State
                                </label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                                >
                                    <option value="">Select a state</option>
                                    {states.map((state) => (
                                        <option key={state.id} value={state.id}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    City Image
                                </label>
                                <div className="relative">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    setCityImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                            >
                                                <X size={14} className="text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                                            <Upload className="text-zinc-600 mb-2" size={24} />
                                            <span className="text-xs text-zinc-500">Click to upload image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-500">{error}</p>
                            )}

                            <button
                                onClick={handleAddCity}
                                disabled={isLoading}
                                className="w-full py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Creating...' : 'Create City'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit City Modal */}
            {showEditModal && editingCity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-light text-white">Edit City</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* City Name */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    City Name
                                </label>
                                <input
                                    type="text"
                                    value={newCityName}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                    City Image
                                </label>
                                <div className="relative">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            {!editingCity.image_url && cityImage && (
                                                <button
                                                    onClick={() => {
                                                        setCityImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                                >
                                                    <X size={14} className="text-white" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                                            <Upload className="text-zinc-600 mb-2" size={24} />
                                            <span className="text-xs text-zinc-500">Click to upload image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                {editingCity.image_url && !cityImage && (
                                    <button
                                        onClick={() => handleDeleteImage(editingCity.id)}
                                        className="mt-2 text-xs text-red-500 hover:text-red-400"
                                    >
                                        Remove current image
                                    </button>
                                )}
                            </div>

                            {error && (
                                <p className="text-xs text-red-500">{error}</p>
                            )}

                            <button
                                onClick={handleUpdateCity}
                                disabled={isLoading}
                                className="w-full py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin" />}
                                {isLoading ? 'Updating...' : 'Update City'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
