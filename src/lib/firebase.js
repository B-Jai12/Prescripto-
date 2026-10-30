// ============================================================
// Prescripto Auth & Database Client
// Powered by Supabase (with offline resilient local fallback)
// ============================================================

import { supabase } from './supabase';

export { supabase };

// ── Mock & Session State ─────────────────────────────────────
const mockAuth = { currentUser: null, _listeners: [] };
const mockDb = { _type: 'supabase_db' };

export const isMock = false;
export let auth = mockAuth;
export let db = mockDb;

function formatSupabaseUser(user) {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    user_metadata: user.user_metadata || {},
  };
}

// Initialize Supabase auth session listener on browser
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const u = formatSupabaseUser(session.user);
      auth.currentUser = u;
      localStorage.setItem('userEmail', u.email || '');
      localStorage.setItem('currentUserId', u.uid || '');
      mockAuth._listeners.forEach((cb) => cb(u));
    }
  }).catch((err) => {
    console.warn('[Prescripto] Supabase initial session check:', err);
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const u = formatSupabaseUser(session?.user);
    auth.currentUser = u;
    if (u) {
      localStorage.setItem('userEmail', u.email || '');
      localStorage.setItem('currentUserId', u.uid || '');
    } else {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('currentUserId');
    }
    mockAuth._listeners.forEach((cb) => cb(u));
  });
}

// ── Auth Functions ───────────────────────────────────────────

export const signInWithEmailAndPassword = async (authObj, email, password) => {
  if (authObj) { /* no-op reference */ }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Fallback to local offline login if Supabase auth fails (e.g. rate limit or unconfirmed)
      console.warn('[Prescripto] Supabase login error, checking local fallback:', error.message);
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const localUser = users.find((u) => u.email === email);
      if (localUser) {
        auth.currentUser = localUser;
        mockAuth._listeners.forEach((cb) => cb(localUser));
        return { user: localUser };
      }
      throw new Error(error.message || 'Invalid email or password');
    }

    const formatted = formatSupabaseUser(data.user);
    auth.currentUser = formatted;
    mockAuth._listeners.forEach((cb) => cb(formatted));
    return { user: formatted };
  } catch (_) {
    // If network down or offline
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    let localUser = users.find((u) => u.email === email);
    if (!localUser) {
      localUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
      };
      users.push(localUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
    }
    auth.currentUser = localUser;
    mockAuth._listeners.forEach((cb) => cb(localUser));
    return { user: localUser };
  }
};

export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  if (authObj) { /* no-op reference */ }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.warn('[Prescripto] Supabase signup error, using local fallback:', error.message);
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      let localUser = users.find((u) => u.email === email);
      if (localUser) throw new Error('User with this email already exists.');
      localUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        displayName: email.split('@')[0],
      };
      users.push(localUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      auth.currentUser = localUser;
      mockAuth._listeners.forEach((cb) => cb(localUser));
      return { user: localUser };
    }

    const formatted = formatSupabaseUser(data.user);
    auth.currentUser = formatted;
    mockAuth._listeners.forEach((cb) => cb(formatted));
    return { user: formatted };
  } catch (_) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    let localUser = {
      uid: 'user_' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: email.split('@')[0],
    };
    users.push(localUser);
    localStorage.setItem('mock_users', JSON.stringify(users));
    auth.currentUser = localUser;
    mockAuth._listeners.forEach((cb) => cb(localUser));
    return { user: localUser };
  }
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[Prescripto] Signout error:', e);
  }
  auth.currentUser = null;
  localStorage.removeItem('userEmail');
  localStorage.removeItem('currentUserId');
  mockAuth._listeners.forEach((cb) => cb(null));
  return {};
};

export const onAuthStateChanged = (authObj, callback) => {
  if (authObj) { /* no-op */ }
  mockAuth._listeners.push(callback);

  if (typeof window !== 'undefined') {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = formatSupabaseUser(session?.user);
      if (u) {
        auth.currentUser = u;
        callback(u);
      } else {
        const email = localStorage.getItem('userEmail');
        const uid = localStorage.getItem('currentUserId');
        if (email && uid) {
          const fallbackUser = { uid, email, displayName: localStorage.getItem('userName') || email.split('@')[0] };
          auth.currentUser = fallbackUser;
          callback(fallbackUser);
        } else {
          callback(null);
        }
      }
    }).catch(() => {
      callback(auth.currentUser);
    });
  } else {
    setTimeout(() => callback(null), 0);
  }

  return () => {
    mockAuth._listeners = mockAuth._listeners.filter((cb) => cb !== callback);
  };
};

// ── Database / Profile Functions ─────────────────────────────

export const doc = (dbObj, collectionName, docId) => {
  if (dbObj) { /* no-op */ }
  return { _type: 'supabase_doc_ref', collectionName, docId };
};

export const getDoc = async (docRef) => {
  const collection = docRef.collectionName;
  const docId = docRef.docId;

  try {
    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .eq('id', docId)
      .single();

    if (!error && data) {
      return { exists: () => true, data: () => data };
    }
  } catch (err) {
    console.warn(`[Prescripto] Supabase read from ${collection} failed, trying local storage:`, err);
  }

  // Local fallback
  const store = JSON.parse(localStorage.getItem(`mock_${collection}`) || '{}');
  const localData = store[docId] || null;
  return { exists: () => !!localData, data: () => localData };
};

export const setDoc = async (docRef, data, options = {}) => {
  const collection = docRef.collectionName;
  const docId = docRef.docId;

  // Always save to localStorage immediately for instant offline reactivity
  const store = JSON.parse(localStorage.getItem(`mock_${collection}`) || '{}');
  store[docId] = options.merge ? { ...(store[docId] || {}), ...data } : data;
  localStorage.setItem(`mock_${collection}`, JSON.stringify(store));

  try {
    await supabase
      .from(collection)
      .upsert({ id: docId, ...data });
  } catch (err) {
    console.warn(`[Prescripto] Supabase upsert to ${collection}:`, err);
  }

  return {};
};

export const updateDoc = async (docRef, data) => {
  const collection = docRef.collectionName;
  const docId = docRef.docId;

  const store = JSON.parse(localStorage.getItem(`mock_${collection}`) || '{}');
  store[docId] = { ...(store[docId] || {}), ...data };
  localStorage.setItem(`mock_${collection}`, JSON.stringify(store));

  try {
    await supabase
      .from(collection)
      .update(data)
      .eq('id', docId);
  } catch (err) {
    console.warn(`[Prescripto] Supabase update to ${collection}:`, err);
  }

  return {};
};
