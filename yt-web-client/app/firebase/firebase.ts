// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User
 } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export function signInwithGoogle(){
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut(){
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user: User | null) => void){
    return onAuthStateChanged(auth, callback);
}