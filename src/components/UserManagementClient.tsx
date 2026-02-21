'use client';

import { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import { deleteUser, type UserWithProfile } from '@/app/actions/users';

interface UserManagementClientProps {
    initialUsers: UserWithProfile[];
    currentUserId: string;
    currentUserEmail: string;
    isSuperAdmin: boolean;
}

const SUPER_ADMIN_EMAIL = 'studyinbengalurub2b@gmail.com';

export default function UserManagementClient({ initialUsers, currentUserId, currentUserEmail, isSuperAdmin }: UserManagementClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState(initialUsers);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleSuccess = () => {
        window.location.reload();
    };

    const handleDeleteUser = async (userId: string, userEmail: string, userRole: string) => {
        if (userEmail === SUPER_ADMIN_EMAIL) {
            alert('Cannot delete super admin account!');
            return;
        }

        if (userRole === 'admin' && !isSuperAdmin) {
            alert('Only super admin can delete admin accounts!');
            return;
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setDeletingUserId(userId);
        const result = await deleteUser(userId, currentUserEmail);

        if (result.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert(`Failed to delete user: ${result.error}`);
        }
        setDeletingUserId(null);
    };

    return (
        <>
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-light tracking-tight text-gray-900">Network Members</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Manage access & permissions</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* User List - CRED Style Table */}
                <div className="px-4 pb-8">
                    <div className="flex flex-col gap-[1px] bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                        {users.length === 0 ? (
                            <div className="bg-gray-50 p-12 text-center">
                                <p className="text-gray-500 text-sm font-light tracking-wide italic">No members currently in the network.</p>
                            </div>
                        ) : (
                            users.map((user) => {
                                const isSuperAdminUser = user.email === SUPER_ADMIN_EMAIL;
                                const isCurrentUser = user.id === currentUserId;

                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-all group"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <p className="text-gray-900 font-medium tracking-tight truncate">{user.email}</p>

                                                {/* Minimalist Badges */}
                                                <div className="flex gap-1.5">
                                                    <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${
                                                        user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                    {isSuperAdminUser && (
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                                                            Super
                                                        </span>
                                                    )}
                                                    {isCurrentUser && (
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                            Self
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px]">
                                                {user.full_name && (
                                                    <span className="text-gray-500 font-light">{user.full_name}</span>
                                                )}
                                                <span className="text-gray-400 font-mono text-[10px]">
                                                    Member since {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {!isCurrentUser && !isSuperAdminUser && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                                                    disabled={deletingUserId === user.id}
                                                    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-200 rounded-lg hover:border-red-500/50 hover:text-red-500 transition-all disabled:opacity-30 group-hover:bg-gray-100"
                                                >
                                                    {deletingUserId === user.id ? 'Removing...' : 'Remove'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <CreateUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                currentUserEmail={currentUserEmail}
                isSuperAdmin={isSuperAdmin}
            />
        </>
    );
}