'use client';

import { useState, useEffect } from 'react';
import {
    getCollegeById,
    updateCollege,
    addCollegeImage,
    deleteCollegeImage,
    addCollegeVideo,
    deleteCollegeVideo,
    uploadBrochure,
    uploadFeeStructurePdf,
    getAllCourses,
    getCoursesByCollege,
    linkCoursesToCollege,
    type College,
    type Course,
    type CollegeImage,
    type CollegeVideo,
} from '@/app/actions/colleges';
import {
    X,
    Save,
    Upload,
    Trash2,
    Plus,
    Loader2,
    FileText,
    Image as ImageIcon,
    Video,
    GraduationCap,
    Info,
    AlignLeft,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import CourseMultiSelect from '@/components/CourseMultiSelect';

interface EditCollegeModalProps {
    isOpen: boolean;
    collegeId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type TabId = 'info' | 'descriptions' | 'media' | 'courses';

export default function EditCollegeModal({ isOpen, collegeId, onClose, onSuccess }: EditCollegeModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // College data
    const [college, setCollege] = useState<any>(null);
    const [images, setImages] = useState<CollegeImage[]>([]);
    const [videos, setVideos] = useState<CollegeVideo[]>([]);

    // Editable fields — Info
    const [name, setName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    // Editable fields — Descriptions
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');

    // Media uploads
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newBrochure, setNewBrochure] = useState<File | null>(null);
    const [newFeeStructure, setNewFeeStructure] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingBrochure, setUploadingBrochure] = useState(false);
    const [uploadingFeeStructure, setUploadingFeeStructure] = useState(false);
    const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
    const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

    // Courses
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [savingCourses, setSavingCourses] = useState(false);

    useEffect(() => {
        if (isOpen && collegeId) {
            loadCollegeData();
        }
    }, [isOpen, collegeId]);

    const loadCollegeData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [collegeResult, coursesResult, collegeCourseResult] = await Promise.all([
                getCollegeById(collegeId),
                getAllCourses(),
                getCoursesByCollege(collegeId),
            ]);

            if (collegeResult.success && collegeResult.data) {
                const c = collegeResult.data;
                setCollege(c);
                setName(c.name || '');
                setSpecialization(c.specialization || '');
                setContactEmail(c.contact_email || '');
                setContactPhone(c.contact_phone || '');
                setWebsiteUrl(c.website_url || '');
                setShortDescription(c.short_description || '');
                setLongDescription(c.long_description || '');
                setImages(c.images || []);
                setVideos(c.videos || []);
            } else {
                setError('Failed to load college data');
            }

            if (coursesResult.success && coursesResult.data) {
                setAllCourses(coursesResult.data);
            }

            if (collegeCourseResult.success && collegeCourseResult.data) {
                setSelectedCourseIds(
                    collegeCourseResult.data.map((cc: any) => cc.course_id)
                );
            }
        } catch (err) {
            setError('Failed to load college data');
        } finally {
            setIsLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    // ── Save Basic Info ──
    const handleSaveInfo = async () => {
        setIsSaving(true);
        setError('');
        try {
            const result = await updateCollege(collegeId, {
                name,
                specialization,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                website_url: websiteUrl,
            } as any);
            if (result.success) {
                showSuccess('Basic info saved successfully');
                onSuccess();
            } else {
                setError(result.error || 'Failed to save');
            }
        } catch (err) {
            setError('Failed to save basic info');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Save Descriptions ──
    const handleSaveDescriptions = async () => {
        setIsSaving(true);
        setError('');
        try {
            const result = await updateCollege(collegeId, {
                short_description: shortDescription,
                long_description: longDescription,
            } as any);
            if (result.success) {
                showSuccess('Descriptions saved successfully');
                onSuccess();
            } else {
                setError(result.error || 'Failed to save');
            }
        } catch (err) {
            setError('Failed to save descriptions');
        } finally {
            setIsSaving(false);
        }
    };

    // ── Image Upload ──
    const handleUploadImages = async () => {
        if (newImages.length === 0) return;
        setUploadingImage(true);
        setError('');
        try {
            for (const image of newImages) {
                const fd = new FormData();
                fd.append('collegeId', collegeId);
                fd.append('file', image);
                await addCollegeImage(fd);
            }
            setNewImages([]);
            await loadCollegeData();
            showSuccess(`${newImages.length} image(s) uploaded`);
            onSuccess();
        } catch (err) {
            setError('Failed to upload images');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm('Delete this image?')) return;
        setDeletingImageId(imageId);
        try {
            const result = await deleteCollegeImage(imageId);
            if (result.success) {
                setImages(images.filter(img => img.id !== imageId));
                showSuccess('Image deleted');
                onSuccess();
            } else {
                setError(result.error || 'Failed to delete image');
            }
        } catch (err) {
            setError('Failed to delete image');
        } finally {
            setDeletingImageId(null);
        }
    };

    // ── Video Add/Delete ──
    const handleAddVideo = async () => {
        if (!newVideoUrl.trim()) return;
        setUploadingVideo(true);
        setError('');
        try {
            const platform = newVideoUrl.includes('youtube') ? 'youtube' : newVideoUrl.includes('vimeo') ? 'vimeo' : 'other';
            const result = await addCollegeVideo(collegeId, { url: newVideoUrl, platform });
            if (result.success) {
                setNewVideoUrl('');
                await loadCollegeData();
                showSuccess('Video added');
                onSuccess();
            } else {
                setError(result.error || 'Failed to add video');
            }
        } catch (err) {
            setError('Failed to add video');
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (!confirm('Delete this video?')) return;
        setDeletingVideoId(videoId);
        try {
            const result = await deleteCollegeVideo(videoId);
            if (result.success) {
                setVideos(videos.filter(v => v.id !== videoId));
                showSuccess('Video deleted');
                onSuccess();
            } else {
                setError(result.error || 'Failed to delete video');
            }
        } catch (err) {
            setError('Failed to delete video');
        } finally {
            setDeletingVideoId(null);
        }
    };

    // ── Brochure Upload ──
    const handleUploadBrochure = async () => {
        if (!newBrochure) return;
        setUploadingBrochure(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('collegeId', collegeId);
            fd.append('file', newBrochure);
            const result = await uploadBrochure(fd);
            if (result.success) {
                setNewBrochure(null);
                setCollege({ ...college, brochure_url: result.data?.brochure_url });
                await loadCollegeData();
                showSuccess('Brochure uploaded');
                onSuccess();
            } else {
                setError(result.error || 'Failed to upload brochure');
            }
        } catch (err) {
            setError('Failed to upload brochure');
        } finally {
            setUploadingBrochure(false);
        }
    };

    // ── Fee Structure Upload ──
    const handleUploadFeeStructure = async () => {
        if (!newFeeStructure) return;
        setUploadingFeeStructure(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('collegeId', collegeId);
            fd.append('file', newFeeStructure);
            const result = await uploadFeeStructurePdf(fd);
            if (result.success) {
                setNewFeeStructure(null);
                await loadCollegeData();
                showSuccess('Fee structure uploaded');
                onSuccess();
            } else {
                setError(result.error || 'Failed to upload fee structure');
            }
        } catch (err) {
            setError('Failed to upload fee structure');
        } finally {
            setUploadingFeeStructure(false);
        }
    };

    // ── Courses Save ──
    const handleSaveCourses = async () => {
        setSavingCourses(true);
        setError('');
        try {
            const result = await linkCoursesToCollege(collegeId, selectedCourseIds);
            if (result.success) {
                showSuccess('Courses updated');
                onSuccess();
            } else {
                setError(result.error || 'Failed to update courses');
            }
        } catch (err) {
            setError('Failed to update courses');
        } finally {
            setSavingCourses(false);
        }
    };

    if (!isOpen) return null;

    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'info', label: 'Basic Info', icon: Info },
        { id: 'descriptions', label: 'Descriptions', icon: AlignLeft },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'courses', label: 'Courses', icon: GraduationCap },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-[60] p-0 md:p-6">
            <div className="relative bg-white border border-gray-300 w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col md:rounded-2xl shadow-2xl">

                {/* HEADER */}
                <div className="p-6 flex justify-between items-center border-b border-gray-200 bg-gray-50">
                    <div>
                        <p className="text-[10px] font-mono text-purple-600 tracking-widest uppercase mb-1">Edit Mode</p>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight truncate max-w-lg">
                            {isLoading ? 'Loading...' : name || 'Edit College'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-200 bg-white px-6 gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setError(''); }}
                            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Status messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                            <X className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {successMsg}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* ───── INFO TAB ───── */}
                            {activeTab === 'info' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">College Name</label>
                                        <input
                                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-gray-300 py-3 text-xl font-semibold text-gray-900 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</label>
                                            <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="e.g. Engineering" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Website URL</label>
                                            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="https://..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Email</label>
                                            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="admin@college.edu" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Phone</label>
                                            <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:border-purple-500 outline-none" placeholder="+91 ..." />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button onClick={handleSaveInfo} disabled={isSaving}
                                            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 shadow-md">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {isSaving ? 'Saving...' : 'Save Info'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ───── DESCRIPTIONS TAB ───── */}
                            {activeTab === 'descriptions' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Short Summary</label>
                                            <span className="text-[10px] font-mono text-purple-600">{shortDescription.length}/150</span>
                                        </div>
                                        <textarea
                                            value={shortDescription} onChange={(e) => setShortDescription(e.target.value.slice(0, 150))}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 focus:border-purple-500 outline-none h-24 resize-none"
                                            placeholder="Brief highlights..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Detailed Description</label>
                                        <textarea
                                            value={longDescription} onChange={(e) => setLongDescription(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 focus:border-purple-500 outline-none h-48 resize-none leading-relaxed"
                                            placeholder="Provide comprehensive details..."
                                        />
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button onClick={handleSaveDescriptions} disabled={isSaving}
                                            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 shadow-md">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {isSaving ? 'Saving...' : 'Save Descriptions'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ───── MEDIA TAB ───── */}
                            {activeTab === 'media' && (
                                <div className="space-y-8">
                                    {/* ── Images Section ── */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Photos ({images.length})
                                        </h3>
                                        {/* Existing images */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                            {images.map((img) => (
                                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                                    <img src={img.image_url} alt={img.caption || 'College'} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => handleDeleteImage(img.id)}
                                                        disabled={deletingImageId === img.id}
                                                        className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                                    >
                                                        {deletingImageId === img.id
                                                            ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                            : <Trash2 className="w-5 h-5 text-white" />
                                                        }
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Upload new images */}
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-purple-500/50 hover:bg-purple-50 transition-all relative">
                                                <input type="file" multiple accept="image/*"
                                                    onChange={(e) => { if (e.target.files) setNewImages(Array.from(e.target.files)); }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" />
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <p className="text-gray-500 text-xs">{newImages.length > 0 ? `${newImages.length} file(s) selected` : 'Select images'}</p>
                                            </div>
                                            {newImages.length > 0 && (
                                                <button onClick={handleUploadImages} disabled={uploadingImage}
                                                    className="px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 text-xs uppercase tracking-wider flex items-center gap-2">
                                                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    Upload
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Videos Section ── */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Video className="w-4 h-4" /> Videos ({videos.length})
                                        </h3>
                                        {/* Existing videos */}
                                        <div className="space-y-2 mb-4">
                                            {videos.map((vid) => (
                                                <div key={vid.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 group">
                                                    <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700 truncate flex-1">{vid.title || vid.video_url}</span>
                                                    <a href={vid.video_url} target="_blank" rel="noopener" className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteVideo(vid.id)}
                                                        disabled={deletingVideoId === vid.id}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        {deletingVideoId === vid.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <Trash2 className="w-4 h-4" />
                                                        }
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Add new video */}
                                        <div className="flex gap-2">
                                            <input
                                                type="url" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)}
                                                placeholder="YouTube or Vimeo URL"
                                                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-purple-500 text-sm"
                                            />
                                            <button onClick={handleAddVideo} disabled={uploadingVideo || !newVideoUrl.trim()}
                                                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 text-xs uppercase tracking-wider flex items-center gap-2">
                                                {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Documents Section ── */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Documents
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Brochure */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brochure PDF</label>
                                                {college?.brochure_url && (
                                                    <a href={college.brochure_url} target="_blank" rel="noopener"
                                                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors">
                                                        <FileText className="w-4 h-4" /> Current brochure
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                <input type="file" accept=".pdf" onChange={(e) => { if (e.target.files) setNewBrochure(e.target.files[0]); }}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200" />
                                                {newBrochure && (
                                                    <button onClick={handleUploadBrochure} disabled={uploadingBrochure}
                                                        className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 text-xs uppercase flex items-center justify-center gap-2">
                                                        {uploadingBrochure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        {uploadingBrochure ? 'Uploading...' : 'Upload Brochure'}
                                                    </button>
                                                )}
                                            </div>
                                            {/* Fee Structure */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Structure PDF</label>
                                                {college?.fee_structure_pdf_url && (
                                                    <a href={college.fee_structure_pdf_url} target="_blank" rel="noopener"
                                                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors">
                                                        <FileText className="w-4 h-4" /> Current fee structure
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                <input type="file" accept=".pdf" onChange={(e) => { if (e.target.files) setNewFeeStructure(e.target.files[0]); }}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200" />
                                                {newFeeStructure && (
                                                    <button onClick={handleUploadFeeStructure} disabled={uploadingFeeStructure}
                                                        className="w-full py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 text-xs uppercase flex items-center justify-center gap-2">
                                                        {uploadingFeeStructure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        {uploadingFeeStructure ? 'Uploading...' : 'Upload Fee Structure'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ───── COURSES TAB ───── */}
                            {activeTab === 'courses' && (
                                <div className="space-y-6 max-w-2xl">
                                    <CourseMultiSelect
                                        courses={allCourses}
                                        selectedCourseIds={selectedCourseIds}
                                        onChange={setSelectedCourseIds}
                                    />
                                    <div className="pt-4 flex justify-end">
                                        <button onClick={handleSaveCourses} disabled={savingCourses}
                                            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 shadow-md">
                                            {savingCourses ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {savingCourses ? 'Saving...' : 'Save Courses'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
