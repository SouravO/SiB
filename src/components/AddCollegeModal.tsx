'use client';

import { useState, useEffect } from 'react';
import {
    getStates,
    getCitiesByState,
    getUniversitiesByCity,
    createCollege,
    addCollegeImage,
    addCollegeVideo,
    uploadBrochure,
    createState,
    createCity,
    createUniversity,
    type State,
    type City,
    type University
} from '@/app/actions/colleges';

interface AddCollegeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function AddCollegeModal({ isOpen, onClose, onSuccess }: AddCollegeModalProps) {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Location
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');

    // Modals for adding new entities
    const [showAddStateModal, setShowAddStateModal] = useState(false);
    const [showAddCityModal, setShowAddCityModal] = useState(false);
    const [showAddUniversityModal, setShowAddUniversityModal] = useState(false);
    const [newStateName, setNewStateName] = useState('');
    const [newCityName, setNewCityName] = useState('');
    const [newUniversityName, setNewUniversityName] = useState('');

    // Step 2: Basic Info
    const [collegeName, setCollegeName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    // Step 3: Descriptions
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');

    // Step 4: Media
    const [images, setImages] = useState<File[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>(['']);
    const [brochurePdf, setBrochurePdf] = useState<File | null>(null);

    // Load states on mount
    useEffect(() => {
        if (isOpen) {
            loadStates();
        }
    }, [isOpen]);

    const loadStates = async () => {
        const result = await getStates();
        if (result.success && result.data) {
            setStates(result.data);
        }
    };

    const handleAddState = async () => {
        if (!newStateName.trim()) {
            setError('State name is required');
            return;
        }

        const result = await createState(newStateName.trim());
        if (result.success && result.data) {
            setStates([...states, result.data]);
            setSelectedState(result.data.id);
            setNewStateName('');
            setShowAddStateModal(false);

            // Clear dependent selections
            setSelectedCity('');
            setSelectedUniversity('');
            setCities([]);
            setUniversities([]);
        } else {
            setError(result.error || 'Failed to create state');
        }
    };

    const handleAddCity = async () => {
        if (!newCityName.trim()) {
            setError('City name is required');
            return;
        }

        if (!selectedState) {
            setError('Please select a state first');
            return;
        }

        const result = await createCity(newCityName.trim(), selectedState);
        if (result.success && result.data) {
            setCities([...cities, result.data]);
            setSelectedCity(result.data.id);
            setNewCityName('');
            setShowAddCityModal(false);

            // Clear dependent selection
            setSelectedUniversity('');
            setUniversities([]);
        } else {
            setError(result.error || 'Failed to create city');
        }
    };

    const handleAddUniversity = async () => {
        if (!newUniversityName.trim()) {
            setError('University name is required');
            return;
        }

        if (!selectedCity) {
            setError('Please select a city first');
            return;
        }

        const result = await createUniversity(newUniversityName.trim(), selectedCity);
        if (result.success && result.data) {
            setUniversities([...universities, result.data]);
            setSelectedUniversity(result.data.id);
            setNewUniversityName('');
            setShowAddUniversityModal(false);
        } else {
            setError(result.error || 'Failed to create university');
        }
    };

    const handleStateChange = async (stateId: string) => {
        setSelectedState(stateId);
        setSelectedCity('');
        setSelectedUniversity('');
        setCities([]);
        setUniversities([]);

        if (stateId) {
            const result = await getCitiesByState(stateId);
            if (result.success && result.data) {
                setCities(result.data);
            }
        }
    };

    const handleCityChange = async (cityId: string) => {
        setSelectedCity(cityId);
        setSelectedUniversity('');
        setUniversities([]);

        if (cityId) {
            const result = await getUniversitiesByCity(cityId);
            if (result.success && result.data) {
                setUniversities(result.data);
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const addVideoUrl = () => {
        setVideoUrls([...videoUrls, '']);
    };

    const updateVideoUrl = (index: number, value: string) => {
        const newUrls = [...videoUrls];
        newUrls[index] = value;
        setVideoUrls(newUrls);
    };

    const removeVideoUrl = (index: number) => {
        setVideoUrls(videoUrls.filter((_, i) => i !== index));
    };

    const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBrochurePdf(e.target.files[0]);
        }
    };



    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Create college
            const collegeResult = await createCollege({
                name: collegeName,
                university_id: selectedUniversity,
                specialization,
                short_description: shortDescription,
                long_description: longDescription,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                website_url: websiteUrl,
            });

            if (!collegeResult.success || !collegeResult.data) {
                throw new Error(collegeResult.error || 'Failed to create college');
            }

            const collegeId = collegeResult.data.id;

            // Upload images
            // Upload images
            for (const image of images) {
                const formData = new FormData();
                formData.append('collegeId', collegeId);
                formData.append('file', image);
                await addCollegeImage(formData);
            }

            // Add video URLs
            for (const url of videoUrls) {
                if (url.trim()) {
                    const platform = url.includes('youtube') ? 'youtube' : url.includes('vimeo') ? 'vimeo' : 'other';
                    await addCollegeVideo(collegeId, { url, platform });
                }
            }

            // Upload brochure
            // Upload brochure
            if (brochurePdf) {
                const formData = new FormData();
                formData.append('collegeId', collegeId);
                formData.append('file', brochurePdf);
                await uploadBrochure(formData);
            }

            setIsLoading(false);
            onSuccess();
            resetForm();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create college');
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedState('');
        setSelectedCity('');
        setSelectedUniversity('');
        setCollegeName('');
        setSpecialization('');
        setContactEmail('');
        setContactPhone('');
        setWebsiteUrl('');
        setShortDescription('');
        setLongDescription('');
        setImages([]);
        setVideoUrls(['']);
        setBrochurePdf(null);
        setError('');
    };

    const canProceedStep1 = selectedState && selectedCity && selectedUniversity;
    const canProceedStep2 = collegeName.trim().length > 0;
    const canProceedStep3 = shortDescription.trim().length > 0 && longDescription.trim().length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Add New College
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= step
                                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                    : 'border-slate-600 text-slate-600'
                                    }`}>
                                    {step}
                                </div>
                                {step < 5 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${currentStep > step ? 'bg-purple-500' : 'bg-slate-600'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 text-center text-sm text-slate-400">
                        {currentStep === 1 && 'Location Selection'}
                        {currentStep === 2 && 'Basic Information'}
                        {currentStep === 3 && 'Descriptions'}
                        {currentStep === 4 && 'Media Upload'}
                        {currentStep === 5 && 'Review & Submit'}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Location */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    State *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedState}
                                        onChange={(e) => handleStateChange(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select State</option>
                                        {states.map((state) => (
                                            <option key={state.id} value={state.id}>{state.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddStateModal(true)}
                                        className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg text-white text-sm font-medium"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    City *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => handleCityChange(e.target.value)}
                                        disabled={!selectedState}
                                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCityModal(true)}
                                        disabled={!selectedState}
                                        className={`px-4 py-3 rounded-lg text-white text-sm font-medium ${selectedState
                                                ? 'bg-gradient-to-r from-cyan-600 to-purple-600'
                                                : 'bg-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    University *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedUniversity}
                                        onChange={(e) => setSelectedUniversity(e.target.value)}
                                        disabled={!selectedCity}
                                        className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    >
                                        <option value="">Select University</option>
                                        {universities.map((uni) => (
                                            <option key={uni.id} value={uni.id}>{uni.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUniversityModal(true)}
                                        disabled={!selectedCity}
                                        className={`px-4 py-3 rounded-lg text-white text-sm font-medium ${selectedCity
                                                ? 'bg-gradient-to-r from-cyan-600 to-purple-600'
                                                : 'bg-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Info */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    College Name *
                                </label>
                                <input
                                    type="text"
                                    value={collegeName}
                                    onChange={(e) => setCollegeName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter college name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Specialization
                                </label>
                                <input
                                    type="text"
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Engineering, Medical, Arts"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="contact@college.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="+91 1234567890"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Website URL
                                </label>
                                <input
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://college.edu"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Descriptions */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Short Description * <span className="text-slate-500">({shortDescription.length}/150)</span>
                                </label>
                                <textarea
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value.slice(0, 150))}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Brief description (max 150 characters)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Long Description *
                                </label>
                                <textarea
                                    value={longDescription}
                                    onChange={(e) => setLongDescription(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Detailed description about the college, facilities, courses, achievements, etc."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Media */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    College Photos
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(img)}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Videos */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Video URLs (YouTube/Vimeo)
                                </label>
                                {videoUrls.map((url, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => updateVideoUrl(idx, e.target.value)}
                                            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                        {videoUrls.length > 1 && (
                                            <button
                                                onClick={() => removeVideoUrl(idx)}
                                                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addVideoUrl}
                                    className="mt-2 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded-lg hover:bg-purple-600/30"
                                >
                                    + Add Another Video
                                </button>
                            </div>

                            {/* Brochure */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Brochure PDF
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleBrochureChange}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {brochurePdf && (
                                    <p className="mt-2 text-sm text-green-400">✓ {brochurePdf.name}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {currentStep === 5 && (
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Review College Details</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-slate-400">College:</span> <span className="text-white">{collegeName}</span></p>
                                    <p><span className="text-slate-400">Specialization:</span> <span className="text-white">{specialization || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Email:</span> <span className="text-white">{contactEmail || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Phone:</span> <span className="text-white">{contactPhone || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Website:</span> <span className="text-white">{websiteUrl || 'N/A'}</span></p>
                                    <p><span className="text-slate-400">Images:</span> <span className="text-white">{images.length} photo(s)</span></p>
                                    <p><span className="text-slate-400">Videos:</span> <span className="text-white">{videoUrls.filter(u => u.trim()).length} video(s)</span></p>
                                    <p><span className="text-slate-400">Brochure:</span> <span className="text-white">{brochurePdf ? 'Yes' : 'No'}</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6 flex justify-between">
                    <button
                        onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as Step)}
                        disabled={currentStep === 1}
                        className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={() => setCurrentStep((currentStep + 1) as Step)}
                            disabled={
                                (currentStep === 1 && !canProceedStep1) ||
                                (currentStep === 2 && !canProceedStep2) ||
                                (currentStep === 3 && !canProceedStep3)
                            }
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white rounded-lg hover:scale-105 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create College'}
                        </button>
                    )}
                </div>
            </div>

            {/* Add State Modal */}
            {showAddStateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New State</h3>
                            <button
                                onClick={() => {
                                    setShowAddStateModal(false);
                                    setError('');
                                }}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    State Name *
                                </label>
                                <input
                                    type="text"
                                    value={newStateName}
                                    onChange={(e) => setNewStateName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter state name"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowAddStateModal(false);
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddState}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white rounded-lg hover:scale-[1.02] transition"
                                >
                                    Add State
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add City Modal */}
            {showAddCityModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New City</h3>
                            <button
                                onClick={() => {
                                    setShowAddCityModal(false);
                                    setError('');
                                }}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    City Name *
                                </label>
                                <input
                                    type="text"
                                    value={newCityName}
                                    onChange={(e) => setNewCityName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter city name"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowAddCityModal(false);
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCity}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white rounded-lg hover:scale-[1.02] transition"
                                >
                                    Add City
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add University Modal */}
            {showAddUniversityModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New University</h3>
                            <button
                                onClick={() => {
                                    setShowAddUniversityModal(false);
                                    setError('');
                                }}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    University Name *
                                </label>
                                <input
                                    type="text"
                                    value={newUniversityName}
                                    onChange={(e) => setNewUniversityName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter university name"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowAddUniversityModal(false);
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddUniversity}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-white rounded-lg hover:scale-[1.02] transition"
                                >
                                    Add University
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
