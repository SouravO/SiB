'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'admin' || !profile) {
          router.push('/');
        } else {
          router.push('/user');
        }
        router.refresh();
      }
    } catch (err) {
      setError('Internal security error.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white flex flex-col font-sans selection:bg-white selection:text-purple-900">
      {/* Top Progress Bar */}
      <div className="h-[2px] w-full bg-purple-950 overflow-hidden">
        <div className={`h-full bg-white transition-all duration-1000 ease-out ${isLoading ? 'w-full' : 'w-0'}`} />
      </div>
      <div className='bg-white/45 w-1/12 rounded-2xl '>
      <img src="/assets/logo.png" alt="Logo" className='w-full h-full object-contain' />
        </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 max-w-lg mx-auto w-full">
        
        {/* Logo/Icon Area */}
        <div className="w-full mb-16">
          
          
          <h1 className="text-5xl font-extralight tracking-tight leading-tight">
            Access <br />
            <span className="font-semibold text-white">privileges.</span>
          </h1>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-8 py-3 text-purple-300 text-xs font-mono border-l-2 border-purple-500 pl-4 bg-purple-500/5">
             {error.toUpperCase()}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-12">
          <div className="space-y-10">
            {/* Input Email */}
            <div className="group border-b border-purple-900/50 focus-within:border-white transition-all duration-500">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-purple-400/60 mb-1">
                Identity / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                placeholder="yourname@domain.com"
                className="w-full bg-transparent py-4 text-xl outline-none placeholder:text-purple-900 font-light"
              />
            </div>

            {/* Input Password */}
            <div className="group border-b border-purple-900/50 focus-within:border-white transition-all duration-500">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-purple-400/60 mb-1">
                Security Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent py-4 text-xl outline-none placeholder:text-purple-900 font-light tracking-widest"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-purple-950 py-5 text-xs font-bold uppercase tracking-[0.25em] hover:bg-purple-50 transition-all active:scale-[0.99] disabled:bg-purple-900/20 disabled:text-purple-700 overflow-hidden relative"
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                Claim Access
              </span>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="w-1.5 h-1.5 bg-purple-950 rounded-full animate-ping"></span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <footer className="mt-16 w-full flex flex-col gap-4">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
            <div className="flex justify-between items-center text-[9px] font-mono text-purple-500/50 uppercase tracking-widest">
                <button type="button" className="hover:text-white transition decoration-purple-500 underline-offset-4 hover:underline">Reset Key</button>
                <button type="button" className="hover:text-white transition decoration-purple-500 underline-offset-4 hover:underline">New Application</button>
            </div>
        </footer>
      </main>

      {/* Decorative Branding */}
      <div className="fixed bottom-[-10%] left-[-5%] opacity-[0.03] pointer-events-none select-none">
        <h2 className="text-[40rem] font-bold text-white">P</h2>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;600;800&family=JetBrains+Mono&display=swap');
        
        body {
          background-color: #0a0118;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px #0a0118 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}