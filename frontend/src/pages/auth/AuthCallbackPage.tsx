import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/app/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      });
    } else {
      navigate('/app/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-[#737373]">Authenticating session...</p>
      </div>
    </div>
  );
}
