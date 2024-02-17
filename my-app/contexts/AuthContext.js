// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Importing the 'auth' instance directly

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password); // Using the 'auth' instance directly
  }

  function signOut() {
    return auth.signOut(); // Using the 'auth' instance directly
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => { // Using the 'auth' instance directly
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
