// Firebase Configuration for RISHIKA BLOOMS
// Real-time Cloud Synchronization across all devices globally

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBo668JHD7hC36MMZcLpWoa1aIb1i6fZ_c",
  authDomain: "rishika-blooms-59be4.firebaseapp.com",
  projectId: "rishika-blooms-59be4",
  storageBucket: "rishika-blooms-59be4.firebasestorage.app",
  messagingSenderId: "392024910717",
  appId: "1:392024910717:web:rishikablooms"
};

export const getFirebaseConfig = () => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rb_firebase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.projectId && parsed.apiKey) {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rb_firebase_config', JSON.stringify(config));
    }
    return true;
  } catch (e) {
    console.error('Error saving Firebase config:', e);
    return false;
  }
};
