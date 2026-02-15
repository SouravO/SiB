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
            <div className="bg-[#0a0a0a] rounded-[32px] overflow-hidden">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 gap-4">
                    <div className="space-y-1">
                        <h2 className="text-xl font-light tracking-tight text-white">Network Members</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Manage access & permissions</p>
                    </div>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Member
                    </button>
                </div>

                {/* User List - CRED Style Table */}
                <div className="px-4 pb-8">
                    <div className="flex flex-col gap-[1px] bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        {users.length === 0 ? (
                            <div className="bg-[#0f0f0f] p-12 text-center">
                                <p className="text-slate-500 text-sm font-light tracking-wide italic">No members currently in the network.</p>
                            </div>
                        ) : (
                            users.map((user) => {
                                const isSuperAdminUser = user.email === SUPER_ADMIN_EMAIL;
                                const isCurrentUser = user.id === currentUserId;

                                return (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-5 bg-[#0a0a0a] hover:bg-[#111] transition-all group"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <p className="text-[#eeeeee] font-medium tracking-tight truncate">{user.email}</p>
                                                
                                                {/* Minimalist Badges */}
                                                <div className="flex gap-1.5">
                                                    <span className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded ${
                                                        user.role === 'admin' 
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                                        : 'bg-white/5 text-slate-400 border border-white/10'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                    {isSuperAdminUser && (
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            Super
                                                        </span>
                                                    )}
                                                    {isCurrentUser && (
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            Self
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-[11px]">
                                                {user.full_name && (
                                                    <span className="text-slate-400 font-light">{user.full_name}</span>
                                                )}
                                                <span className="text-slate-600 font-mono text-[10px]">
                                                    Member since {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {!isCurrentUser && !isSuperAdminUser && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                                                    disabled={deletingUserId === user.id}
                                                    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-white/5 rounded-lg hover:border-red-500/50 hover:text-red-500 transition-all disabled:opacity-30 group-hover:bg-[#151515]"
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