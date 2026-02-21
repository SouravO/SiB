import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllUsers } from '@/app/actions/users';
import { getAllColleges, getAllCities } from '@/app/actions/colleges';
import UserManagementClient from '@/components/UserManagementClient';
import CollegeManagementClient from '@/components/CollegeManagementClient';
import CityManagementClient from '@/components/CityManagementClient';

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
  const citiesResult = await getAllCities();
  const allCities = citiesResult.success && citiesResult.data ? citiesResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-purple-500/30">
      {/* Precision Top Border */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="container mx-auto px-6 py-12 max-w-6xl">

        {/* Navigation / Minimalist Header */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-2">
            <h1 className="text-xs font-black tracking-[0.4em] text-purple-600 uppercase">
              Study in Bengaluru
            </h1>
            <p className="text-4xl md:text-5xl font-light tracking-tighter text-gray-900">
              Control <span className="font-serif italic text-gray-500">Center.</span>
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="group relative px-8 py-3 bg-gray-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all duration-500 shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]"
            >
              Secure Sign Out
            </button>
          </form>
        </header>

        {/* Cred-Style Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-gray-200 border border-gray-200 rounded-3xl overflow-hidden mb-16 shadow-xl">
          {[
            { label: 'Network Population', value: allUsers.length },
            { label: 'Privileged Access', value: allUsers.filter(u => u.role === 'admin').length },
            { label: 'Institutions', value: allColleges.length }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-10 hover:bg-gray-50 transition-colors group shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4 group-hover:text-purple-600 transition-colors">
                {stat.label}
              </p>
              <p className="text-5xl font-light tracking-tighter text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management Interfaces */}
        <div className="space-y-24">
          <section className="relative">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-light tracking-tight text-gray-900">User Management</h2>
              <div className="h-[1px] flex-grow bg-gray-200" />
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl p-2 shadow-sm group hover:border-purple-500/20 transition-all duration-700">
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
              <h2 className="text-2xl font-light tracking-tight text-gray-900">College Portfolio</h2>
              <div className="h-[1px] flex-grow bg-gray-200" />
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl p-2 shadow-sm group hover:border-purple-500/20 transition-all duration-700">
              <CollegeManagementClient initialColleges={allColleges} />
            </div>
          </section>

          <section className="relative">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-light tracking-tight text-gray-900">City Management</h2>
              <div className="h-[1px] flex-grow bg-gray-200" />
            </div>
            <div className="bg-white border border-gray-200 rounded-3xl p-2 shadow-sm group hover:border-purple-500/20 transition-all duration-700">
              <CityManagementClient initialCities={allCities} />
            </div>
          </section>
        </div>

        {/* Account Meta / Detailed Footer */}
        <footer className="mt-32 pb-12">
          <div className="bg-gradient-to-b from-gray-100 to-transparent p-12 rounded-[40px] border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Admin Identity</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-gray-900">{user.email}</p>
                  <p className="text-xs font-mono text-purple-600/80 uppercase tracking-widest">{user.id}</p>
                </div>
              </div>

              <div className="md:text-right space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">System Status</h3>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">Encrypted Session Active</p>
                  <p className="text-xs text-gray-400 italic">
                    Last access: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">
              Study in Bengaluru &copy; {new Date().getFullYear()} &bull; Excellence in Education
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}