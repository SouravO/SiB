import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllUsers } from '@/app/actions/users';
import UserManagementClient from '@/components/UserManagementClient';

async function signOut() {
  'use server';

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get current user's profile to check if they're super admin
  const { data: currentUserProfile } = await supabase
    .from('user_profiles')
    .select('email, role')
    .eq('id', user.id)
    .single();

  // Redirect regular users to user dashboard
  if (currentUserProfile?.role === 'user') {
    redirect('/user');
  }

  const SUPER_ADMIN_EMAIL = 'studyinbengalurub2b@gmail.com';
  const isSuperAdmin = currentUserProfile?.email === SUPER_ADMIN_EMAIL;

  // Get all users for admin dashboard
  const allUsers = await getAllUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Manage users and system settings</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{allUsers.length}</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Admins</p>
            <p className="text-3xl font-bold text-white">
              {allUsers.filter(u => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Regular Users</p>
            <p className="text-3xl font-bold text-white">
              {allUsers.filter(u => u.role === 'user').length}
            </p>
          </div>
        </div>

        {/* User Management Section */}
        <UserManagementClient
          initialUsers={allUsers}
          currentUserId={user.id}
          currentUserEmail={user.email || ''}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Current User Info */}
        <div className="mt-8">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Your Account</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-lg text-white">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">User ID</p>
                <p className="text-sm text-slate-300 font-mono break-all">{user.id}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Last Sign In</p>
                <p className="text-lg text-white">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
