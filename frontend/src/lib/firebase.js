// ============================================================
// LipiRx Firebase Client
// Supports:
//   - Live Firebase (when NEXT_PUBLIC_FIREBASE_API_KEY is set)
//   - Local Offline Mock Mode (fallback when keys are missing)
//
// Uses dynamic imports so the firebase package is only loaded
// when real credentials are present. Mock mode works without
// the firebase package installed.
// ============================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Detect mock mode: missing keys OR explicitly requested
export const isMock =
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  firebaseConfig.apiKey === 'undefined' ||
  process.env.NEXT_PUBLIC_USE_MOCK_FIREBASE === 'true';

// ── Lazy-loaded real Firebase instances ──────────────────────
let _auth = null;
let _db = null;

async function getRealFirebase() {
  if (_auth && _db) return { auth: _auth, db: _db };
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  _auth = getAuth(app);
  _db = getFirestore(app);
  return { auth: _auth, db: _db };
}

// ── Mock State ───────────────────────────────────────────────
const mockAuth = { currentUser: null, _listeners: [] };
const mockDb = { _type: 'mock_db' };

// Exported auth/db placeholders (real values set asynchronously)
export let auth = isMock ? mockAuth : null;
export let db = isMock ? mockDb : null;

// If using real Firebase, initialize lazily and update exports
if (!isMock && typeof window !== 'undefined') {
  getRealFirebase()
    .then(({ auth: a, db: d }) => {
      auth = a;
      db = d;
    })
    .catch((err) => {
      console.error('Firebase init failed, using mock mode:', err);
    });
}

if (isMock && typeof window !== 'undefined') {
  console.log('%c[LipiRx] Running in Offline Mock Firebase Mode', 'color: #FF9FFC; font-weight: bold');
}

// ── Auth Functions ───────────────────────────────────────────

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  if (isMock) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
        email,
        displayName: 'Local Developer',
      };
      users.push(user);
      localStorage.setItem('mock_users', JSON.stringify(users));
      const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
      profiles[user.uid] = { id: user.uid, full_name: 'Local Developer', is_pro: false, scan_count: 0 };
      localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    }
    mockAuth.currentUser = user;
    localStorage.setItem('mock_session', JSON.stringify({ user }));
    mockAuth._listeners.forEach((cb) => cb(user));
    return { user };
  }
  const { auth: a } = await getRealFirebase();
  const { signInWithEmailAndPassword: fbSignIn } = await import('firebase/auth');
  return fbSignIn(a, email, password);
};

export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
  if (isMock) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    if (users.find((u) => u.email === email)) {
      throw new Error('Firebase: Error (auth/email-already-in-use).');
    }
    const newUser = {
      uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
      email,
      displayName: '',
    };
    users.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(users));
    mockAuth.currentUser = newUser;
    localStorage.setItem('mock_session', JSON.stringify({ user: newUser }));
    mockAuth._listeners.forEach((cb) => cb(newUser));
    return { user: newUser };
  }
  const { auth: a } = await getRealFirebase();
  const { createUserWithEmailAndPassword: fbCreate } = await import('firebase/auth');
  return fbCreate(a, email, password);
};

export const signOut = async (authInstance) => {
  if (isMock) {
    mockAuth.currentUser = null;
    localStorage.removeItem('mock_session');
    mockAuth._listeners.forEach((cb) => cb(null));
    return {};
  }
  const { auth: a } = await getRealFirebase();
  const { signOut: fbSignOut } = await import('firebase/auth');
  return fbSignOut(a);
};

export const onAuthStateChanged = (authInstance, callback) => {
  if (isMock) {
    mockAuth._listeners.push(callback);
    if (typeof window !== 'undefined') {
      const session = JSON.parse(localStorage.getItem('mock_session') || 'null');
      if (session && session.user) {
        const user = { uid: session.user.uid, email: session.user.email, displayName: session.user.displayName || 'Local Developer' };
        mockAuth.currentUser = user;
        setTimeout(() => callback(user), 0);
      } else {
        mockAuth.currentUser = null;
        setTimeout(() => callback(null), 0);
      }
    } else {
      setTimeout(() => callback(null), 0);
    }
    return () => {
      mockAuth._listeners = mockAuth._listeners.filter((cb) => cb !== callback);
    };
  }
  // Real Firebase — attach listener after init
  let unsubscribe = () => {};
  getRealFirebase().then(({ auth: a }) => {
    import('firebase/auth').then(({ onAuthStateChanged: fbOnAuth }) => {
      unsubscribe = fbOnAuth(a, callback);
    });
  });
  return () => unsubscribe();
};

// ── Firestore Functions ──────────────────────────────────────

export const doc = (dbInstance, collectionName, docId) => {
  // Always return a mock doc_ref — the real Firestore doc()
  // is resolved lazily inside getDoc/setDoc/updateDoc
  if (isMock || !dbInstance || dbInstance._type === 'mock_db') {
    return { _type: 'doc_ref', collectionName, docId };
  }
  // _db is already initialized synchronously by getRealFirebase() if live mode
  return { _type: 'live_doc_ref', collectionName, docId, db: dbInstance };
};

export const getDoc = async (docRef) => {
  if (isMock || docRef._type === 'doc_ref') {
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    const data = profiles[docRef.docId] || null;
    return { exists: () => !!data, data: () => data };
  }
  // live_doc_ref: build real Firestore DocumentReference on demand
  const { getDoc: fbGetDoc, doc: fbDoc } = await import('firebase/firestore');
  const realRef = fbDoc(docRef.db, docRef.collectionName, docRef.docId);
  return fbGetDoc(realRef);
};

export const setDoc = async (docRef, data, options = {}) => {
  if (isMock || docRef._type === 'doc_ref') {
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    profiles[docRef.docId] = options.merge
      ? { ...(profiles[docRef.docId] || {}), ...data }
      : data;
    localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    return {};
  }
  const { setDoc: fbSetDoc, doc: fbDoc } = await import('firebase/firestore');
  const realRef = fbDoc(docRef.db, docRef.collectionName, docRef.docId);
  return fbSetDoc(realRef, data, options);
};

export const updateDoc = async (docRef, data) => {
  if (isMock || docRef._type === 'doc_ref') {
    const profiles = JSON.parse(localStorage.getItem('mock_profiles') || '{}');
    if (!profiles[docRef.docId]) throw new Error('Document does not exist');
    profiles[docRef.docId] = { ...profiles[docRef.docId], ...data };
    localStorage.setItem('mock_profiles', JSON.stringify(profiles));
    return {};
  }
  const { updateDoc: fbUpdateDoc, doc: fbDoc } = await import('firebase/firestore');
  const realRef = fbDoc(docRef.db, docRef.collectionName, docRef.docId);
  return fbUpdateDoc(realRef, data);
};
