import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only fall back to mock if credentials are genuinely missing or placeholder
const isDeadOrMissingUrl = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl === 'YOUR_SUPABASE_URL';

const createMockClient = () => {
  console.log('--- LipiRx: Running in Local Offline Mock Auth Mode ---');
  
  const getProfiles = () => {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('mock_profiles') || '{}');
  };
  
  const saveProfiles = (p) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mock_profiles', JSON.stringify(p));
  };
  
  return {
    auth: {
      signUp: async ({ email, password, options }) => {
        if (typeof window === 'undefined') return { data: { user: null }, error: { message: 'Window undefined' } };
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.find(u => u.email === email)) {
          return { data: { user: null }, error: { message: 'User already exists' } };
        }
        const newUser = { 
          id: 'mock-uid-' + Math.random().toString(36).substr(2, 9), 
          email, 
          user_metadata: { full_name: options?.data?.full_name || '' } 
        };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));
        
        // Initialize profile
        const profiles = getProfiles();
        profiles[newUser.id] = { 
          id: newUser.id, 
          full_name: options?.data?.full_name || 'User', 
          is_pro: false, 
          scan_count: 0 
        };
        saveProfiles(profiles);
        
        localStorage.setItem('mock_session', JSON.stringify({ user: newUser }));
        return { data: { user: newUser }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        if (typeof window === 'undefined') return { data: { user: null }, error: { message: 'Window undefined' } };
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        let user = users.find(u => u.email === email);
        if (!user) {
          // Auto-create user for frictionless development experience
          user = { 
            id: 'mock-uid-' + Math.random().toString(36).substr(2, 9), 
            email, 
            user_metadata: { full_name: 'Local Developer' } 
          };
          users.push(user);
          localStorage.setItem('mock_users', JSON.stringify(users));
          
          const profiles = getProfiles();
          profiles[user.id] = { 
            id: user.id, 
            full_name: 'Local Developer', 
            is_pro: false, 
            scan_count: 0 
          };
          saveProfiles(profiles);
        }
        localStorage.setItem('mock_session', JSON.stringify({ user }));
        return { data: { user }, error: null };
      },
      getSession: async () => {
        if (typeof window === 'undefined') return { data: { session: null }, error: null };
        const session = JSON.parse(localStorage.getItem('mock_session') || 'null');
        return { data: { session }, error: null };
      },
      getUser: async () => {
        if (typeof window === 'undefined') return { data: { user: null }, error: null };
        const session = JSON.parse(localStorage.getItem('mock_session') || 'null');
        return { data: { user: session?.user || null }, error: null };
      },
      signOut: async () => {
        if (typeof window === 'undefined') return { error: null };
        localStorage.removeItem('mock_session');
        return { error: null };
      }
    },
    from: (table) => {
      return {
        select: (fields) => {
          return {
            eq: (field, val) => {
              return {
                single: async () => {
                  if (table === 'profiles') {
                    const profiles = getProfiles();
                    const profile = profiles[val] || { id: val, is_pro: false, scan_count: 0, full_name: 'Local Developer' };
                    return { data: profile, error: null };
                  }
                  return { data: null, error: null };
                }
              };
            }
          };
        },
        update: (values) => {
          return {
            eq: async (field, val) => {
              if (table === 'profiles') {
                const profiles = getProfiles();
                profiles[val] = { ...(profiles[val] || {}), ...values };
                saveProfiles(profiles);
              }
              return { error: null };
            }
          };
        },
        upsert: async (values) => {
          if (table === 'profiles') {
            const profiles = getProfiles();
            const id = values.id;
            profiles[id] = { ...(profiles[id] || {}), ...values };
            saveProfiles(profiles);
          }
          return { error: null };
        }
      };
    }
  };
};

export const supabase = isDeadOrMissingUrl
  ? createMockClient()
  : createBrowserClient(
      supabaseUrl,
      supabaseAnonKey
    );
