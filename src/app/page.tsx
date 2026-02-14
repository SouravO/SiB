import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to Your Dashboard
            </h1>
            <p className="text-slate-400 mt-2">You're successfully logged in!</p>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:scale-105 transition-all duration-200"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* User Info Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">User Information</h2>

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
