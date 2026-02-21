'use client';

import { useState, useMemo } from 'react';
import { Course } from '@/app/actions/colleges';
import { X, Check, Search, ChevronDown } from 'lucide-react';

interface CourseMultiSelectProps {
    courses: Course[];
    selectedCourseIds: string[];
    onChange: (selectedIds: string[]) => void;
}

export default function CourseMultiSelect({
    courses,
    selectedCourseIds,
    onChange
}: CourseMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    console.log('CourseMultiSelect - courses received:', courses?.length);
    console.log('CourseMultiSelect - selectedCourseIds:', selectedCourseIds);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(courses?.map(c => c.category));
        return ['all', ...Array.from(cats)];
    }, [courses]);

    // Filter courses based on search and category
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.degree.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [courses, searchQuery, selectedCategory]);

    // Group courses by category
    const coursesByCategory = useMemo(() => {
        const grouped: Record<string, typeof filteredCourses> = {};
        filteredCourses.forEach(course => {
            if (!grouped[course.category]) {
                grouped[course.category] = [];
            }
            grouped[course.category].push(course);
        });
        return grouped;
    }, [filteredCourses]);

    const handleToggleCourse = (courseId: string) => {
        if (selectedCourseIds.includes(courseId)) {
            onChange(selectedCourseIds.filter(id => id !== courseId));
        } else {
            onChange([...selectedCourseIds, courseId]);
        }
    };

    const handleSelectAll = (category: string) => {
        const courseIdsInCategory = courses
            .filter(c => c.category === category)
            .map(c => c.id);
        
        const newIds = selectedCourseIds.includes('all')
            ? selectedCourseIds.filter(id => !courseIdsInCategory.includes(id))
            : [...selectedCourseIds, ...courseIdsInCategory];
        
        onChange(newIds);
    };

    const selectedCourses = courses.filter(c => selectedCourseIds.includes(c.id));

    return (
        <div className="relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Courses Offered ({selectedCourseIds.length})
            </label>

            {/* Selected Courses Display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 min-h-[50px] cursor-pointer flex flex-wrap gap-2 items-center outline-none focus:border-purple-500/50"
            >
                {selectedCourses.length === 0 ? (
                    <span className="text-gray-500 text-sm">Select courses...</span>
                ) : (
                    <>
                        {selectedCourses.slice(0, 5).map(course => (
                            <span
                                key={course.id}
                                className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-700 border border-purple-500/30 rounded px-2 py-1 text-xs"
                            >
                                {course.name}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCourse(course.id);
                                    }}
                                    className="hover:text-purple-900"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        {selectedCourses.length > 5 && (
                            <span className="text-gray-500 text-xs">
                                +{selectedCourses.length - 5} more
                            </span>
                        )}
                        <ChevronDown
                            size={16}
                            className={`ml-auto text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-[500px] overflow-hidden flex flex-col">
                    {/* Search and Filter */}
                    <div className="p-4 border-b border-gray-200 space-y-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses..."
                                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm outline-none focus:border-purple-500/30 placeholder:text-gray-400"
                            />
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 text-sm outline-none focus:border-purple-500/30"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Course List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
                            <div key={category}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        {category}
                                    </h4>
                                    <button
                                        onClick={() => handleSelectAll(category)}
                                        className="text-xs text-gray-500 hover:text-purple-700 transition-colors"
                                    >
                                        {categoryCourses.every(c => selectedCourseIds.includes(c.id))
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {categoryCourses.map(course => {
                                        const isSelected = selectedCourseIds.includes(course.id);
                                        return (
                                            <button
                                                key={course.id}
                                                type="button"
                                                onClick={() => handleToggleCourse(course.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                    isSelected
                                                        ? 'bg-purple-100 border-purple-500/30'
                                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                                                        {course.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {course.degree} • {course.duration_years} {course.duration_years === 1 ? 'year' : 'years'}
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                    isSelected
                                                        ? 'bg-purple-500 border-purple-500'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-purple-500 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
