import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const isMountedRef = useRef(true);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Failed to fetch profile:', error);
      setProfileError('Unable to load account information.');
      return null;
    }
    setProfileError(null);
    return data;
  };

  useEffect(() => {
    isMountedRef.current = true;

    // একই handler দুই জায়গা থেকে call হবে (getSession + onAuthStateChange) - এতে
    // যেটাই আগে resolve হোক না কেন, state সবসময় সঠিক থাকবে, কোনো race/override হবে না
    const applySession = async (session) => {
      if (!isMountedRef.current) return;

      if (session?.user) {
        setUser(session.user);
        const fetchedProfile = await fetchProfile(session.user.id);
        if (isMountedRef.current) setProfile(fetchedProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    };

    // ১. আগে listener বসানো হচ্ছে, যাতে এর মাঝে কোনো auth event miss না হয়
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    // ২. তারপর explicit ভাবে current session আনা হচ্ছে (cold-start-এর জন্য নিশ্চিত উৎস) -
    // এটা resolve হওয়া মাত্রই loading বন্ধ করে দেওয়া হয়, তাই Navbar প্রথমবারেই সঠিক state দেখবে
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session).finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
    });

    return () => {
      isMountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) setProfile(await fetchProfile(user.id));
  };

  const balances = profile
    ? { spot: profile.balance_spot, futures: profile.balance_futures }
    : { spot: 0, futures: 0 };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        balances,
        isAdmin: profile?.is_admin ?? false,
        bonusStatus: profile?.bonus_status ?? 'locked',
        bonusLockedAmount: profile?.bonus_locked_amount ?? 0,
        loading,
        profileError,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);