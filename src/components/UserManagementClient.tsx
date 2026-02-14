'use client';

import { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { deleteUser, type UserWithProfile } from '@/app/actions/users';

interface UserManagementClientProps {
    initialUsers: UserWithProfile[];
    currentUserId: string;
}

// Super admin email that cannot be deleted
const SUPER_ADMIN_EMAIL = 'studyinbengalurub2b@gmail.com';

export default function UserManagementClient({ initialUsers, currentUserId }: UserManagementClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState(initialUsers);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleSuccess = () => {
        // Refresh the page to get updated user list
        window.location.reload();
    };

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        // Prevent deletion of super admin
        if (userEmail === SUPER_ADMIN_EMAIL) {
            alert('Cannot delete super admin account!');
            return;
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setDeletingUserId(userId);
        const result = await deleteUser(userId);

        if (result.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert(`Failed to delete user: ${result.error}`);
        }
        setDeletingUserId(null);
    };

    return (
        <>
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">User Management</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New User
                    </button>
                </div>

                {/* User List */}
                <div className="space-y-3">
                    {users.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No users found</p>
                    ) : (
                        users.map((user) => {
                            const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                            const isCurrentUser = user.id === currentUserId;

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="text-white font-medium">{user.email}</p>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded ${user.role === 'admin'
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                            {isSuperAdmin && (
                                                <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                                                    Super Admin
                                                </span>
                                            )}
                                            {isCurrentUser && (
                                                <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/50">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        {user.full_name && (
                                            <p className="text-sm text-slate-400 mt-1">{user.full_name}</p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">
                                            Created: {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {!isCurrentUser && !isSuperAdmin && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                            disabled={deletingUserId === user.id}
                                            className="ml-4 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}
