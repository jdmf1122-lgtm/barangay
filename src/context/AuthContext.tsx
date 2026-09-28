import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabaseClient';
import { SEED_USERS } from '../data/seedData';

export interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: User;
  users: User[];
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUserState: React.Dispatch<React.SetStateAction<User>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUserStr = localStorage.getItem('bconnect_roxas_user_v11');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.id) return parsed;
      } catch (e) { }
    }
    return SEED_USERS[0];
  });
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsersStr = localStorage.getItem('bconnect_roxas_users_v11');
    if (savedUsersStr) {
      try {
        const parsed = JSON.parse(savedUsersStr);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return SEED_USERS;
  });

  useEffect(() => {
    const checkSession = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUserState(profile as User);
            setIsAuthenticated(true);
            localStorage.setItem('bconnect_roxas_user_v11', JSON.stringify(profile));
            localStorage.setItem('bconnect_roxas_auth_status_v11', 'true');
          }
        } else {
          const savedAuth = localStorage.getItem('bconnect_roxas_auth_status_v11');
          const savedUserStr = localStorage.getItem('bconnect_roxas_user_v11');
          if (savedAuth === 'true' && savedUserStr) {
            try {
              const parsed = JSON.parse(savedUserStr);
              if (parsed?.id) {
                setCurrentUserState(parsed);
                setIsAuthenticated(true);
              }
            } catch (e) { }
          }
        }
      } catch (err) {
        console.warn('Session check error, fallback to local:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const { data: dbUsers } = await supabase.from('users').select('*');
        const userMap = new Map<string, User>();
        // 1. Add SEED_USERS so official government accounts are always present
        SEED_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));

        // 2. Add cached users (which may preserve local passcodes)
        const cachedUsersStr = localStorage.getItem('bconnect_roxas_users_v11');
        if (cachedUsersStr) {
          try {
            const cached = JSON.parse(cachedUsersStr);
            if (Array.isArray(cached)) {
              cached.forEach((u: any) => {
                if (u?.email) {
                  const existing = userMap.get(u.email.toLowerCase());
                  userMap.set(u.email.toLowerCase(), { ...existing, ...u });
                }
              });
            }
          } catch (e) {}
        }

        // 3. Add remote dbUsers from Supabase
        if (dbUsers && Array.isArray(dbUsers) && dbUsers.length > 0) {
          dbUsers.forEach((u: any) => {
            if (u?.email) {
              const existing = userMap.get(u.email.toLowerCase());
              userMap.set(u.email.toLowerCase(), { ...existing, ...u });
            }
          });
        }

        const merged = Array.from(userMap.values());
        setUsers(merged);
        localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify(merged));
      } catch (e) {
        console.warn('Fetch users notice:', e);
      }
    };

    checkSession();
    fetchUsers();

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('bconnect_users_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'USER_REGISTERED' && event.data.payload) {
            setUsers((prev) => {
              const filtered = prev.filter((u) => u.id !== event.data.payload.id && u.email !== event.data.payload.email);
              const updated = [...filtered, event.data.payload];
              localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify(updated));
              return updated;
            });
          }
        };
      } catch (e) {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUserState(profile as User);
          setIsAuthenticated(true);
          localStorage.setItem('bconnect_roxas_user_v11', JSON.stringify(profile));
          localStorage.setItem('bconnect_roxas_auth_status_v11', 'true');
        }
      } else if (event === 'SIGNED_OUT') {
        // Prevent spurious auto-logout on refresh unless explicit logout occurred
        const savedAuth = localStorage.getItem('bconnect_roxas_auth_status_v11');
        if (savedAuth === 'false') {
          setIsAuthenticated(false);
          localStorage.removeItem('bconnect_roxas_user_v11');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthLoading,
      currentUser,
      users,
      setIsAuthenticated,
      setCurrentUserState,
      setUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
