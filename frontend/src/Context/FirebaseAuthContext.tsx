import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode
} from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  setLogLevel,
  
} from 'firebase/firestore';
import app, { auth } from '@/lib/firebase';


interface FirebaseContextType {
  user: User | null;
  userRole: string | null;

  signInWithGoogle: () => Promise<User>;
  
  signOut: () => Promise<void>;
}

// --- Context + Hook ---
const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context)
    throw new Error("useFirebase must be used within FirebaseProvider");
  return context;
};
// Custom hook to use the AuthContext

// Auth Provider Component
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string> ("");
  const [loading, setLoading] = useState(true);
  const [authInstance, setAuthInstance] = useState(null);
  const [dbInstance, setDbInstance] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
 
  useEffect(() => {
   

    try {
      setLogLevel('debug');
      const db = getFirestore(app);
    
      setAuthInstance(auth);
      if(db){
      setDbInstance(db);

      }

      const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          try {
            setUser(authUser);
            const userDocRef = doc(db, `/artifacts/${appId}/users/${authUser.uid}`, 'profile');
            const docSnap = await getDoc(userDocRef);
            let role = 'user';
            if (docSnap.exists()) {
              role = docSnap.data().role || 'user';
            } else {
              await setDoc(userDocRef, { role, email: authUser.email, createdAt: new Date() });
            }
            setUserRole(role);
          } catch (err) {
            console.error('Error fetching user role:', err);
            setUserRole('user');
          }
        } else {
          setUser(null);
          setUserRole("");
        }
        if (isMounted.current) {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Failed to initialize Firebase:', e);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const autoSignIn = async () => {
      if (authInstance && !user && app) {
        try {
          await signInWithCustomToken(authInstance, initialAuthToken);
          console.log('Signed in with custom token successfully.');
        } catch (error) {
          console.error('Sign-in with custom token failed:', error);
          if (error.code === 'auth/invalid-custom-token') {
            console.warn('The custom token is invalid. Attempting to sign in anonymously.');
            try {
              await signInAnonymously(authInstance);
              console.log('Signed in anonymously successfully.');
            } catch (anonError) {
              console.error('Anonymous sign-in failed:', anonError);
            }
          }
        }
      }
    };
    autoSignIn();
  }, [authInstance, user, app]);

  

  const signInWithGoogle = async () : Promise<User>  => {
    if (!authInstance || !dbInstance) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    const user = result.user;

    const userDocRef = doc(dbInstance, `/artifacts/${process.env.NEXT_PUBLIC_appId}/users/${user.uid}`, 'profile');
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        role: 'user',
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return user;
  };

  
const signOut = () => {
    // localStorage.removeItem("user");
    // localStorage.removeItem("userRole");
    return firebaseSignOut(auth);
  };
  
const value: FirebaseContextType = {
    user,
    userRole,
   signInWithGoogle,
    signOut,
  };
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};