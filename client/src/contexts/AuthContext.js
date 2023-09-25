import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateEmail,
    updatePassword,
    sendPasswordResetEmail,
  } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
   return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
   const [currentUser, setCurrentUser] = useState();
   const [loading, setLoading] = useState(true);
   function signup(email, password) {
      return createUserWithEmailAndPassword(auth, email, password);
   }

   function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserEmail(email) {
    return updateEmail(auth.currentUser, email);
  }

  function updateUserPassword(password) {
    return updatePassword(auth.currentUser, password);
  }

   useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
         setCurrentUser(user);
         setLoading(false);
      });

      return unsubscribe;
   }, []);

   const value = {
      currentUser,
      signup,
      login,
      logout,
      resetPassword,
      updateUserEmail,
      updateUserPassword
   };
   return (
      <AuthContext.Provider value={value}>
         {!loading && children}
      </AuthContext.Provider>
   );
}