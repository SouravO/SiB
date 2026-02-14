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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md">
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-gradient-x"></div>

                {/* Modal content */}
                <div className="relative bg-slate-900 rounded-2xl p-6 shadow-2xl border border-white/10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Create New User
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-slate-400 hover:text-white transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Success message */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                            <p className="text-green-400 text-sm text-center">✓ User created successfully!</p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50"
                                placeholder="user@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password *
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                                Full Name (Optional)
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                                Role *
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50"
                            >
                                <option value="user">User</option>
                                {isSuperAdmin && <option value="admin">Admin</option>}
                            </select>
                            {!isSuperAdmin && (
                                <p className="mt-1 text-xs text-slate-500">Only super admin can create admin accounts</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium hover:bg-slate-700 transition duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* CSS for animations */}
            <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
