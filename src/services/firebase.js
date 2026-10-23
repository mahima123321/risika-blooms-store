// Firebase Firestore Service for RISHIKA BLOOMS
// Real-time Cloud Synchronization across all devices globally

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { getFirebaseConfig } from '../config/firebaseConfig';

let app = null;
let db = null;

export const initFirebase = () => {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    try {
      db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true
      });
    } catch {
      db = getFirestore(app);
    }
    return db;
  } catch (err) {
    console.warn('Firebase initialization note:', err);
    return null;
  }
};

export const getDb = () => {
  if (!db) {
    return initFirebase();
  }
  return db;
};

export const isFirebaseLive = () => {
  const firestore = getDb();
  return Boolean(firestore);
};

// ==========================================
// REAL-TIME SUBSCRIBERS (All devices listen live)
// ==========================================

export const subscribeToCloudProducts = (onUpdate, onError) => {
  const firestore = getDb();
  if (!firestore) return () => {};

  try {
    const productsCol = collection(firestore, 'products');
    const unsubscribe = onSnapshot(
      productsCol, 
      (snapshot) => {
        const cloudProducts = [];
        snapshot.forEach((docSnap) => {
          cloudProducts.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (onUpdate) onUpdate(cloudProducts);
      },
      (err) => {
        console.warn('Cloud products sync notice:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to cloud products:', err);
    return () => {};
  }
};

export const subscribeToCloudCategories = (onUpdate, onError) => {
  const firestore = getDb();
  if (!firestore) return () => {};

  try {
    const categoriesCol = collection(firestore, 'categories');
    const unsubscribe = onSnapshot(
      categoriesCol,
      (snapshot) => {
        const cloudCategories = [];
        snapshot.forEach((docSnap) => {
          cloudCategories.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (onUpdate) onUpdate(cloudCategories);
      },
      (err) => {
        console.warn('Cloud categories sync notice:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to cloud categories:', err);
    return () => {};
  }
};

export const subscribeToCloudBrand = (onUpdate, onError) => {
  const firestore = getDb();
  if (!firestore) return () => {};

  try {
    const brandDocRef = doc(firestore, 'store', 'brand');
    const unsubscribe = onSnapshot(
      brandDocRef,
      (docSnap) => {
        if (docSnap.exists() && onUpdate) {
          onUpdate(docSnap.data());
        }
      },
      (err) => {
        console.warn('Cloud brand sync notice:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to cloud brand:', err);
    return () => {};
  }
};

// ==========================================
// CLOUD MUTATIONS (Owner changes sync to all)
// ==========================================

export const cloudSaveProduct = async (product) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const productId = String(product.id);
    const productRef = doc(firestore, 'products', productId);
    // Sanitize data to remove any undefined properties that Firestore rejects
    const cleanProduct = JSON.parse(JSON.stringify(product));
    await setDoc(productRef, {
      ...cleanProduct,
      isDeleted: false,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save product to cloud:', err);
    return false;
  }
};

export const cloudDeleteProduct = async (productId) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const productRef = doc(firestore, 'products', String(productId));
    await setDoc(productRef, {
      id: String(productId),
      isDeleted: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to delete product from cloud:', err);
    return false;
  }
};

export const cloudSaveCategory = async (category) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const catId = String(category.id || category.slug);
    const catRef = doc(firestore, 'categories', catId);
    await setDoc(catRef, {
      ...category,
      isDeleted: false,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save category to cloud:', err);
    return false;
  }
};

export const cloudDeleteCategory = async (categoryId) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const catRef = doc(firestore, 'categories', String(categoryId));
    await setDoc(catRef, {
      id: String(categoryId),
      isDeleted: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to delete category from cloud:', err);
    return false;
  }
};

export const cloudSaveBrand = async (brandData) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const brandRef = doc(firestore, 'store', 'brand');
    await setDoc(brandRef, {
      ...brandData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save brand config to cloud:', err);
    return false;
  }
};

// Bulk upload initial catalog to Firestore
export const cloudBulkUploadCatalog = async (products, categories, brandConfig) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const batch = writeBatch(firestore);

    // Upload products (up to batch limits)
    products.slice(0, 450).forEach((p) => {
      const pRef = doc(firestore, 'products', String(p.id));
      batch.set(pRef, p, { merge: true });
    });

    // Upload categories
    categories.forEach((c) => {
      const cRef = doc(firestore, 'categories', String(c.id || c.slug));
      batch.set(cRef, c, { merge: true });
    });

    // Upload brand config
    if (brandConfig) {
      const bRef = doc(firestore, 'store', 'brand');
      batch.set(bRef, brandConfig, { merge: true });
    }

    await batch.commit();
    return true;
  } catch (err) {
    console.error('Bulk upload to cloud failed:', err);
    return false;
  }
};

// ==========================================
// REAL-TIME ORDERS & OTP DELIVERY VERIFICATION
// ==========================================

export const subscribeToCloudOrders = (onUpdate, onError) => {
  const firestore = getDb();
  if (!firestore) return () => {};

  try {
    const ordersCol = collection(firestore, 'orders');
    const unsubscribe = onSnapshot(
      ordersCol,
      (snapshot) => {
        const cloudOrders = [];
        snapshot.forEach((docSnap) => {
          cloudOrders.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort newest first
        cloudOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (onUpdate) onUpdate(cloudOrders);
      },
      (err) => {
        console.warn('Cloud orders sync notice:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to cloud orders:', err);
    return () => {};
  }
};

export const cloudSaveOrder = async (orderData) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderId = String(orderData.orderId || orderData.id);
    const orderRef = doc(firestore, 'orders', orderId);
    await setDoc(orderRef, {
      ...orderData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save order to cloud:', err);
    return false;
  }
};

export const cloudUpdateOrderStatus = async (orderId, updates) => {
  const firestore = getDb();
  if (!firestore) return false;

  try {
    const orderRef = doc(firestore, 'orders', String(orderId));
    await setDoc(orderRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to update order status in cloud:', err);
    return false;
  }
};

