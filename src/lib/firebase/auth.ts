// src/lib/firebase/auth.ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type AuthError,
  type User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

/**
 * Initiates Google Sign-In popup flow.
 * @returns A promise that resolves with the signed-in User object.
 * @throws Throws an error if sign-in fails.
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    // You might want to handle specific error codes (e.g., 'auth/popup-closed-by-user')
    throw error; // Re-throw the error to be caught by the caller
  }
};

/**
 * Signs in a user with email and password.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the signed-in User object.
 * @throws Throws an AuthError if sign-in fails.
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error as AuthError; // Cast and re-throw
  }
};

/**
 * Creates a new user account with email and password.
 * @param email The new user's email.
 * @param password The new user's password.
 * @returns A promise that resolves with the created User object.
 * @throws Throws an AuthError if account creation fails.
 */
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Optionally: Send verification email, update profile, etc.
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error as AuthError; // Cast and re-throw
  }
};


/**
 * Signs out the current user.
 * @returns A promise that resolves when sign-out is complete.
 * @throws Throws an error if sign-out fails.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error; // Re-throw the error
  }
};

// Optional: Add functions for password reset, email verification, Apple Sign-In etc.
// export const signInWithApple = async (): Promise<User> => { ... }