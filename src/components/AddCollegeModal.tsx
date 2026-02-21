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
    uploadCityImage,
    getAllCourses,
    linkCoursesToCollege,
    type State,
    type City,
    type University,
    type Course
} from '@/app/actions/colleges';
import { X, ChevronRight, ChevronLeft, Upload, Link, CheckCircle2, MapPin, Building2, FileText, Plus, Globe, Image as ImageIcon, GraduationCap } from 'lucide-react';
import CourseMultiSelect from '@/components/CourseMultiSelect';

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
    const [cityImage, setCityImage] = useState<File | null>(null);
    const [cityImagePreview, setCityImagePreview] = useState<string | null>(null);

    // Courses
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

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

    useEffect(() => {
        if (isOpen) {
            loadStates();
            loadCourses();
        }
    }, [isOpen]);

    const loadStates = async () => {
        const result = await getStates();
        if (result.success && result.data) setStates(result.data);
    };

    const loadCourses = async () => {
        console.log('Loading courses...');
        const result = await getAllCourses();
        console.log('Courses result:', result);
        if (result.success && result.data) {
            setCourses(result.data);
            console.log('Courses loaded:', result.data.length);
        } else {
            console.error('Failed to load courses:', result.error);
        }
    };

    const handleAddState = async () => {
        if (!newStateName.trim()) return setError('State name is required');
        const result = await createState(newStateName.trim());
        if (result.success && result.data) {
            setStates([...states, result.data]);
            setSelectedState(result.data.id);
            setNewStateName('');
            setShowAddStateModal(false);
            setCities([]); setUniversities([]);
        } else setError(result.error || 'Failed to create state');
    };

    const handleAddCity = async () => {
        if (!newCityName.trim()) return setError('City name is required');

        console.log('Creating city:', newCityName.trim(), 'in state:', selectedState);
        const result = await createCity(newCityName.trim(), selectedState);
        console.log('Create city result:', result);

        if (result.success && result.data) {
            // Upload image if provided
            if (cityImage) {
                console.log('Uploading city image for city:', result.data.id);
                const uploadResult = await uploadCityImage(result.data.id, cityImage);
                console.log('Upload image result:', uploadResult);
                if (!uploadResult.success) {
                    console.error('Failed to upload image:', uploadResult.error);
                    // Don't fail the whole operation, just log the error
                }
            }

            setCities([...cities, result.data]);
            setSelectedCity(result.data.id);
            setNewCityName('');
            setCityImage(null);
            setCityImagePreview(null);
            setShowAddCityModal(false);
            setUniversities([]);
        } else {
            console.error('Create city failed:', result);
            setError(result.error || 'Failed to create city');
        }
    };

    const handleCityImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCityImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCityImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddUniversity = async () => {
        if (!newUniversityName.trim()) return setError('University name is required');
        const result = await createUniversity(newUniversityName.trim(), selectedCity);
        if (result.success && result.data) {
            setUniversities([...universities, result.data]);
            setSelectedUniversity(result.data.id);
            setNewUniversityName('');
            setShowAddUniversityModal(false);
        } else setError(result.error || 'Failed to create university');
    };

    const handleStateChange = async (stateId: string) => {
        setSelectedState(stateId); setSelectedCity(''); setSelectedUniversity('');
        if (stateId) {
            const result = await getCitiesByState(stateId);
            if (result.success && result.data) setCities(result.data);
        }
    };

    const handleCityChange = async (cityId: string) => {
        setSelectedCity(cityId); setSelectedUniversity('');
        if (cityId) {
            const result = await getUniversitiesByCity(cityId);
            if (result.success && result.data) setUniversities(result.data);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true); setError('');
        try {
            const collegeResult = await createCollege({
                name: collegeName, university_id: selectedUniversity, specialization,
                short_description: shortDescription, long_description: longDescription,
                contact_email: contactEmail, contact_phone: contactPhone, website_url: websiteUrl,
            });
            if (!collegeResult.success || !collegeResult.data) throw new Error(collegeResult.error || 'Failed to create college');
            const collegeId = collegeResult.data.id;

            // Link courses to college
            if (selectedCourseIds.length > 0) {
                const courseLinkResult = await linkCoursesToCollege(collegeId, selectedCourseIds);
                if (!courseLinkResult.success) {
                    console.error('Failed to link courses:', courseLinkResult.error);
                }
            }

            for (const image of images) {
                const fd = new FormData(); fd.append('collegeId', collegeId); fd.append('file', image);
                await addCollegeImage(fd);
            }
            for (const url of videoUrls) {
                if (url.trim()) await addCollegeVideo(collegeId, { url, platform: url.includes('youtube') ? 'youtube' : 'other' });
            }
            if (brochurePdf) {
                const fd = new FormData(); fd.append('collegeId', collegeId); fd.append('file', brochurePdf);
                await uploadBrochure(fd);
            }
            onSuccess(); resetForm(); onClose();
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    const resetForm = () => {
        setCurrentStep(1); setSelectedState(''); setSelectedCity(''); setSelectedUniversity('');
        setCollegeName(''); setImages([]); setVideoUrls(['']); setBrochurePdf(null);
    };

    if (!isOpen) return null;

    const canProceed = [
        selectedState && selectedCity && selectedUniversity,
        collegeName.trim().length > 0,
        shortDescription.trim().length > 0 && longDescription.trim().length > 0,
        true, // Media is optional
        true  // Final review
    ][currentStep - 1];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-[60] p-0 md:p-6">
            <div className="relative bg-white border border-gray-300 w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col md:rounded-2xl shadow-2xl">

                {/* PROGRESS TRACKER */}
                <div className="flex w-full h-1.5 bg-gray-100">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`flex-1 transition-all duration-500 ${currentStep >= s ? 'bg-purple-600' : 'bg-transparent'}`} />
                    ))}
                </div>

                {/* HEADER */}
                <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-200">
                    <div>
                        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Step {currentStep} of 5</p>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {currentStep === 1 && 'Location Details'}
                            {currentStep === 2 && 'Basic Information'}
                            {currentStep === 3 && 'Descriptions'}
                            {currentStep === 4 && 'Media Assets'}
                            {currentStep === 5 && 'Final Review'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                </div>

                {/* FORM BODY */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm font-medium">{error}</div>}

                    {/* STEP 1: LOCATION */}
                    {currentStep === 1 && (
                        <div className="space-y-6 max-w-xl">
                            {[
                                { label: 'State', value: selectedState, options: states, onChange: handleStateChange, onAdd: () => setShowAddStateModal(true), icon: Globe },
                                { label: 'City', value: selectedCity, options: cities, onChange: handleCityChange, onAdd: () => setShowAddCityModal(true), icon: MapPin, disabled: !selectedState },
                                { label: 'University', value: selectedUniversity, options: universities, onChange: setSelectedUniversity, onAdd: () => setShowAddUniversityModal(true), icon: Building2, disabled: !selectedCity },
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <field.icon className="w-3.5 h-3.5" /> {field.label}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={field.value}
                                            disabled={field.disabled}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none transition-all disabled:opacity-20"
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options.map((opt:any) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                        </select>
                                        <button onClick={field.onAdd} disabled={field.disabled} className="px-4 bg-gray-100 hover:bg-purple-500 hover:text-white border border-gray-300 rounded-xl transition-all">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STEP 2: BASIC INFO */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">College Name</label>
                                <input
                                    type="text" value={collegeName} onChange={(e) => setCollegeName(e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-300 py-3 text-2xl font-semibold text-gray-900 focus:border-purple-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</label>
                                    <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="e.g. Engineering" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Website URL</label>
                                    <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Email</label>
                                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="admin@college.edu" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Phone</label>
                                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="+91 ..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DESCRIPTIONS */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Short Summary</label>
                                    <span className="text-[10px] font-mono text-purple-600">{shortDescription.length}/150</span>
                                </div>
                                <textarea
                                    value={shortDescription} onChange={(e) => setShortDescription(e.target.value.slice(0, 150))}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 focus:border-purple-500 outline-none h-24 resize-none"
                                    placeholder="Brief highlights of the institution..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Detailed Description</label>
                                <textarea
                                    value={longDescription} onChange={(e) => setLongDescription(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 focus:border-purple-500 outline-none h-48 resize-none leading-relaxed"
                                    placeholder="Provide comprehensive details about courses, facilities, and campus life..."
                                />
                            </div>

                            {/* Course Selection */}
                            <div className="pt-4 border-t border-gray-200">
                                <CourseMultiSelect
                                    courses={courses}
                                    selectedCourseIds={selectedCourseIds}
                                    onChange={setSelectedCourseIds}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: MEDIA */}
                    {currentStep === 4 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2"><Upload className="w-4 h-4" /> Photos</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-purple-500/50 hover:bg-purple-50 transition-all relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const newFiles = Array.from(e.target.files);
                                                setImages((prev) => [...prev, ...newFiles]);
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm">Upload images</p>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                            <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X className="w-4 h-4 text-white" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2"><Link className="w-4 h-4" /> Video Links</label>
                                {videoUrls.map((url, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input value={url} onChange={(e) => { const n = [...videoUrls]; n[i] = e.target.value; setVideoUrls(n); }} className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-purple-500 text-sm" placeholder="YouTube or Vimeo URL" />
                                        <button onClick={() => setVideoUrls(videoUrls.filter((_, idx) => idx !== i))} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={() => setVideoUrls([...videoUrls, ''])} className="w-full py-2 border border-gray-200 rounded-xl text-gray-500 text-xs font-semibold uppercase hover:bg-gray-100 transition-all">+ Add Link</button>

                                <div className="pt-4">
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2 mb-4"><FileText className="w-4 h-4" /> Brochure (PDF)</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setBrochurePdf(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {currentStep === 5 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-purple-500" /> Confirm Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-t border-gray-200 pt-6">
                                <div>
                                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Name</p>
                                    <p className="text-gray-900 font-medium text-lg">{collegeName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">University</p>
                                    <p className="text-gray-900 font-medium text-lg">{universities.find(u => u.id === selectedUniversity)?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Assets</p>
                                    <p className="text-gray-900 font-medium">{images.length} Photos, {videoUrls.filter(u => u.trim()).length} Videos</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Contact</p>
                                    <p className="text-gray-900 font-medium">{contactEmail || 'No email provided'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 md:p-8 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as Step)}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-0 transition-all font-semibold"
                    >
                        <ChevronLeft className="w-5 h-5" /> Previous
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={() => setCurrentStep((currentStep + 1) as Step)}
                            disabled={!canProceed}
                            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-purple-600 text-white px-10 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Save College'}
                        </button>
                    )}
                </div>
            </div>

            {/* NESTED ADD MODALS */}
            {(showAddStateModal || showAddCityModal || showAddUniversityModal) && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white border border-gray-300 w-full max-w-sm p-6 rounded-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Add New {showAddStateModal ? 'State' : showAddCityModal ? 'City' : 'University'}</h3>
                        <input
                            autoFocus value={showAddStateModal ? newStateName : showAddCityModal ? newCityName : newUniversityName}
                            onChange={(e) => showAddStateModal ? setNewStateName(e.target.value) : showAddCityModal ? setNewCityName(e.target.value) : setNewUniversityName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-purple-500"
                            placeholder="Enter name"
                        />

                        {/* City Image Upload */}
                        {showAddCityModal && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    City Image (Optional)
                                </label>
                                {cityImagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={cityImagePreview}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setCityImage(null);
                                                setCityImagePreview(null);
                                            }}
                                            className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                        >
                                            <X size={12} className="text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                                        <ImageIcon className="text-gray-400 mb-1" size={20} />
                                        <span className="text-xs text-gray-500">Click to upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCityImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setShowAddStateModal(false); setShowAddCityModal(false); setShowAddUniversityModal(false); setCityImage(null); setCityImagePreview(null); }} className="flex-1 py-3 text-gray-500 font-semibold hover:text-gray-700">Cancel</button>
                            <button onClick={showAddStateModal ? handleAddState : showAddCityModal ? handleAddCity : handleAddUniversity} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}