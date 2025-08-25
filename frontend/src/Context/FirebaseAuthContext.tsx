import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { useCookies } from "react-cookie";
import { usePathname } from "next/navigation";

import { Capacitor } from "@capacitor/core";

// Firebase Config (from .env)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId,
  measurementId: process.env.NEXT_PUBLIC_measurementId,
};

// Firebase initialization
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
export { firestore };

// --- Firebase Context Interface ---
interface FirebaseContextType {
  user: User | null;
  userRole: string | null;
  userEmail: string | null;
  signupUserWithEmailAndPassword: (
    email: string,
    password: string,
    isAdmin?: boolean
  ) => Promise<any>;
  signInUserWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<any>;
  signInWithGoogle: () => Promise<User>;
  signInWithFacebook: () => Promise<any>;
  signInWithGitHub: () => Promise<any>;
  signInWithTwitter: () => Promise<any>;
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

// --- Provider Component ---
export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie] = useCookies(["token", "user"]);

  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUserRole = localStorage.getItem("userRole");

    if (storedUser && storedUserRole) {
      setUser(JSON.parse(storedUser));
      setUserRole(storedUserRole);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDoc = doc(firestore, "users", authUser.uid);
        try {
          const docSnap = await getDoc(userDoc);
          let role = "user";
          if (docSnap.exists()) {
            role = docSnap.data()?.role || "user";
          } else {
            await setDoc(userDoc, { role });
          }
          setUserRole(role);
          localStorage.setItem("user", JSON.stringify(authUser));
          setCookie("user", JSON.stringify(authUser), {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });

          const token = await authUser.getIdToken();
          setCookie("token", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });

          localStorage.setItem("userRole", role);
        } catch (err) {
          console.error(err);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Auth Functions ---

  const signupUserWithEmailAndPassword = async (
    email: string,
    password: string,
    isAdmin = false
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    await setDoc(doc(firestore, "users", userCredential.user.uid), {
      role: isAdmin ? "admin" : "user",
    });
    return userCredential;
  };

  const signInUserWithEmailAndPassword = (email: string, password: string) =>
    firebaseSignIn(firebaseAuth, email, password);

  const signInWithGoogle = async (): Promise<User> => {
  try {
    let user: User;

    
      // ✅ Web (browser)
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      user = result.user;
    

    // ✅ Sync with Firestore
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        role: "user",
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    // ✅ Persist
    localStorage.setItem("user", JSON.stringify(user));
    setCookie("user", JSON.stringify(user), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    localStorage.setItem("userRole", "user");

    return user;
  } catch (error: any) {
    console.error("❌ Google Sign-In Error", {
      message: error?.message,
      code: error?.code,
      full: error,
    });
  console.log("❌ Google Sign-In Error:", JSON.stringify(error, null, 2));

    // Developer error (code 10) hint
    if (error?.code === 10) {
      alert("Error Code 10: Check your SHA-1 and OAuth client config.");
    }

    throw error;
  }
};

  const signInWithFacebook = () =>
    signInWithPopup(firebaseAuth, new FacebookAuthProvider());
  const signInWithGitHub = () =>
    signInWithPopup(firebaseAuth, new GithubAuthProvider());
  const signInWithTwitter = () =>
    signInWithPopup(firebaseAuth, new TwitterAuthProvider());

  const signOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    return firebaseSignOut(firebaseAuth);
  };

  const value: FirebaseContextType = {
    user,
    userRole,
    userEmail: user?.email || null,
    signupUserWithEmailAndPassword,
    signInUserWithEmailAndPassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGitHub,
    signInWithTwitter,
    signOut,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};
