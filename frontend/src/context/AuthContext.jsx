import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe } from '../services/api';
import API from '../services/api';
import { generateKeyPair, getStoredPrivateKey, importPrivateKeyJWK } from '../services/crypto';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const initE2EE = async (userData) => {
    if (!userData) return;
    try {
      let privateKey = null;
      let serverHasKeys = false;

      // 1. Always attempt to restore backed-up keys from the server first 
      // This ensures this device is in sync with the server's public key!
      try {
        const { data } = await API.get('/users/my-keys');
        if (data.privateKey) {
          console.log('Syncing backed up E2EE private key from server...');
          privateKey = await importPrivateKeyJWK(userData._id, data.privateKey);
          serverHasKeys = true;
        }
      } catch (e) {
        console.log('No backup keys found on server.');
      }

      // 2. If no backup was found on the server, generate a new pair and upload
      if (!serverHasKeys) {
        console.log('Generating new E2EE keypair...');
        const keys = await generateKeyPair(userData._id);
        await API.post('/users/keys', { 
          publicKey: keys.publicKeyJWK,
          privateKey: keys.privateKeyJWK 
        });
        console.log('Keys generated and backed up successfully.');
      }
    } catch (err) {
      console.error('Failed to init E2EE keys:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('univoid_token');
    if (token) {
      getMe()
        .then((res) => {
          setUserState(res.data);
          initE2EE(res.data).catch(console.error);
        })
        .catch(() => {
          localStorage.removeItem('univoid_token');
          localStorage.removeItem('univoid_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const existingToken = localStorage.getItem('univoid_token');
        // Prevent duplicate authentication checks on page reload if we already have a valid local token
        if (existingToken && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          return; 
        }
        
        let loadingToast;
        try {
          loadingToast = toast.loading('Verifying secure login...');
          const { data } = await API.post('/auth/oauth', { token: session.access_token, provider: 'supabase' });
          login(data.user, data.token);
          toast.dismiss(loadingToast);
          toast.success('Successfully logged in!');
          if (window.location.pathname === '/login' || window.location.pathname === '/register') {
            window.location.href = '/dashboard';
          }
        } catch (err) {
          if (loadingToast) toast.dismiss(loadingToast);
          const errorMsg = err.response?.data?.message || err.message;
          toast.error('Login verification failed: ' + errorMsg);
          console.error('Supabase auth sync failed:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('univoid_token');
        localStorage.removeItem('univoid_user');
        setUserState(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('univoid_token', token);
    localStorage.setItem('univoid_user', JSON.stringify(userData));
    setUserState(userData);
    initE2EE(userData).catch(console.error);
  };

  const logout = async () => {
    localStorage.removeItem('univoid_token');
    localStorage.removeItem('univoid_user');
    setUserState(null);
    try {
      await supabase.auth.signOut();
    } catch(e) {
      console.error('Supabase signout error:', e);
    }
  };

  // Wrapper keeps localStorage in sync — called after profile updates (avatar, etc.)
  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem('univoid_user', JSON.stringify(userData));
    }
    setUserState(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
