'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase SDKs.
 * Optimized to prevent scary warnings in Vercel/Netlify logs during build time.
 */
export function initializeFirebase() {
  // 1. Return existing instance if already initialized
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // 2. Initialize with the provided configuration object.
  // This is the most reliable method for Vercel, Netlify, and local development.
  const firebaseApp = initializeApp(firebaseConfig);
  
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
