import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function signOut() {
    'use server';

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export default async function UserDashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            User Dashboard
                        </h1>
                        <p className="text-slate-400 mt-2">Welcome back, {profile?.full_name || user.email}</p>
                    </div>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>

                {/* Welcome Card */}
                <div className="mb-8">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Welcome to Your Dashboard</h2>
                                <p className="text-slate-400">Manage your account and view your information</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Details */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Account Details</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">Email</p>
                                <p className="text-lg text-white">{user.email}</p>
                            </div>

                            {profile?.full_name && (
                                <div>
                                    <p className="text-sm text-slate-400">Full Name</p>
                                    <p className="text-lg text-white">{profile.full_name}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-slate-400">Role</p>
                                <span className="inline-block px-3 py-1 text-sm font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/50">
                                    {profile?.role || 'user'}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">User ID</p>
                                <p className="text-sm text-slate-300 font-mono break-all">{user.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Information */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Activity</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400">Account Created</p>
                                <p className="text-lg text-white">
                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Last Sign In</p>
                                <p className="text-lg text-white">
                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">Account Status</p>
                                <span className="inline-block px-3 py-1 text-sm font-semibold rounded bg-green-500/20 text-green-400 border border-green-500/50">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Account Type</p>
                                <p className="text-white font-semibold">Standard User</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Security</p>
                                <p className="text-white font-semibold">Protected</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Status</p>
                                <p className="text-white font-semibold">Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
