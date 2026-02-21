'use client';

import { useState } from 'react';
import { createUserWithRole, type UserRole } from '@/app/actions/users';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentUserEmail: string;
    isSuperAdmin: boolean;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess, currentUserEmail, isSuperAdmin }: CreateUserModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await createUserWithRole({
            email,
            password,
            role,
            fullName: fullName || undefined,
            createdBy: currentUserEmail,
        });

        setIsLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                setEmail('');
                setPassword('');
                setFullName('');
                setRole('user');
                setSuccess(false);
                onSuccess();
                onClose();
            }, 1500);
        } else {
            setError(result.error || 'Failed to create user');
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('user');
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
            <div className="relative w-full max-w-md">
                {/* Thin stark border container */}
                <div className="relative bg-white border border-gray-200 p-8 shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-gray-900 leading-none">
                                New Member
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mt-2">
                                Access Control Management
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Success/Error status in CRED style */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-100 text-green-800 text-xs font-black uppercase tracking-widest text-center">
                            User Authorized Successfully
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 border border-red-500/50 text-red-600 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="group">
                            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-purple-600 transition-colors">
                                Email Identity
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 rounded-none text-gray-900 text-lg font-light placeholder-gray-300 focus:outline-none focus:border-purple-600 transition-all duration-300 disabled:opacity-30"
                                placeholder="name@domain.com"
                            />
                        </div>

                        {/* Password */}
                        <div className="group">
                            <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-purple-600 transition-colors">
                                Security Key
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 rounded-none text-gray-900 text-lg font-light placeholder-gray-300 focus:outline-none focus:border-purple-600 transition-all duration-300 disabled:opacity-30"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Full Name */}
                        <div className="group">
                            <label htmlFor="fullName" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-purple-600 transition-colors">
                                Legal Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 rounded-none text-gray-900 text-lg font-light placeholder-gray-300 focus:outline-none focus:border-purple-600 transition-all duration-300 disabled:opacity-30"
                                placeholder="Enter full name"
                            />
                        </div>

                        {/* Role Select */}
                        <div className="group">
                            <label htmlFor="role" className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                                Privilege Level
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                disabled={isLoading}
                                className="w-full px-0 py-3 bg-transparent border-b border-gray-300 rounded-none text-gray-900 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-purple-600 transition-all appearance-none cursor-pointer"
                            >
                                <option value="user" className="bg-white">Standard User</option>
                                {isSuperAdmin && <option value="admin" className="bg-white">Administrator</option>}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all duration-500 disabled:opacity-50 disabled:bg-gray-200 shadow-md"
                            >
                                {isLoading ? 'Processing Authorization...' : 'Create Member'}
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="w-full py-3 bg-transparent text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors disabled:opacity-0"
                            >
                                Cancel Operation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}