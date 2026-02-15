import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllUsers } from '@/app/actions/users';
import { getAllColleges } from '@/app/actions/colleges';
import UserManagementClient from '@/components/UserManagementClient';
import CollegeManagementClient from '@/components/CollegeManagementClient';

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

  const { data: currentUserProfile } = await supabase
    .from('user_profiles')
    .select('email, role')
    .eq('id', user.id)
    .single();

  if (currentUserProfile?.role === 'user') {
    redirect('/user');
  }

  const SUPER_ADMIN_EMAIL = 'studyinbengalurub2b@gmail.com';
  const isSuperAdmin = currentUserProfile?.email === SUPER_ADMIN_EMAIL;

  const allUsers = await getAllUsers();
  const collegesResult = await getAllColleges();
  const allColleges = collegesResult.success && collegesResult.data ? collegesResult.data : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#eeeeee] antialiased selection:bg-purple-500/30">
      {/* Precision Top Border */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        
        {/* Navigation / Minimalist Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-2">
            <h1 className="text-xs font-black tracking-[0.4em] text-purple-500 uppercase">
              Study in Bengaluru
            </h1>
            <p className="text-4xl md:text-5xl font-light tracking-tighter text-white">
              Control <span className="font-serif italic text-slate-400">Center.</span>
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="group relative px-8 py-3 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            >
              Secure Sign Out
            </button>
          </form>
        </header>

        {/* Cred-Style Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/10 border border-white/10 rounded-3xl overflow-hidden mb-16 shadow-2xl">
          {[
            { label: 'Network Population', value: allUsers.length },
            { label: 'Privileged Access', value: allUsers.filter(u => u.role === 'admin').length },
            { label: 'Institutions', value: allColleges.length }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0a0a0a] p-10 hover:bg-[#111] transition-colors group">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4 group-hover:text-purple-400 transition-colors">
                {stat.label}
              </p>
              <p className="text-5xl font-light tracking-tighter text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management Interfaces */}
        <div className="space-y-24">
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-light tracking-tight text-white">User Management</h2>
              <div className="h-[1px] flex-grow bg-white/5" />
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-2 shadow-inner group hover:border-purple-500/20 transition-all duration-700">
              <UserManagementClient
                initialUsers={allUsers}
                currentUserId={user.id}
                currentUserEmail={user.email || ''}
                isSuperAdmin={isSuperAdmin}
              />
            </div>
          </section>

          <section className="relative">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-light tracking-tight text-white">College Portfolio</h2>
              <div className="h-[1px] flex-grow bg-white/5" />
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-2 shadow-inner group hover:border-purple-500/20 transition-all duration-700">
              <CollegeManagementClient initialColleges={allColleges} />
            </div>
          </section>
        </div>

        {/* Account Meta / Detailed Footer */}
        <footer className="mt-32 pb-12">
          <div className="bg-gradient-to-b from-white/5 to-transparent p-12 rounded-[40px] border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Admin Identity</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-white">{user.email}</p>
                  <p className="text-xs font-mono text-purple-500/60 uppercase tracking-widest">{user.id}</p>
                </div>
              </div>

              <div className="md:text-right space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">System Status</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Encrypted Session Active</p>
                  <p className="text-xs text-slate-500 italic">
                    Last access: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
              Study in Bengaluru &copy; {new Date().getFullYear()} &bull; Excellence in Education
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}