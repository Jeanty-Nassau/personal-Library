// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js"
import { setupRealTimeListener } from "./main.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATmRsD654mSxH-9cStkk2qcmpkPCx9mIk",
  authDomain: "personal-library-26122.firebaseapp.com",
  projectId: "personal-library-26122",
  storageBucket: "personal-library-26122.appspot.com",
  messagingSenderId: "656129319368",
  appId: "1:656129319368:web:bfed15a74732a1d562a0fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// connectAuthEmulator(auth, 'http://localhost:5500');

//auth
const signUpUserEmailPassword = () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  const userCredential = createUserWithEmailAndPassword(auth, email, password).catch((e) => {
    console.log(e);
  });
  document.querySelector('.login').reset();
  // console.log(userCredential.user);
  alert('user created');
}

const loginUserEmailPassword = () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const userCredential = signInWithEmailAndPassword(auth, email, password).catch((e) => {
    console.log(e);
  });
  document.querySelector('.login').reset();
  // console.log(userCredential.user);
  alert('user logged in');
}

const monitorAuthState = () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log(user);
      document.querySelector('.dropdown-email').innerHTML = `${user.email.split('@')[0]}`;
      document.querySelector('.main-section').style.display = 'block';
      document.querySelector('.account-section').style.display = 'none';
      setupRealTimeListener();
    } else {
      document.querySelector('.main-section').style.display = 'none';
      document.querySelector('.account-section').style.display = 'flex';
    }
  });
}
monitorAuthState();

const logoutUser = () => {
  signOut(auth).then(() => {
    document.querySelector('.main-section').style.display = 'none';
    document.querySelector('.account-section').style.display = 'flex';
    alert('user signed out');
  }).catch((e) => {
    console.log(e);
  });
}

document.querySelector('.login-button').addEventListener('click', (e) => {
  e.preventDefault();
  loginUserEmailPassword();
  console.log('login button clicked');
});

document.querySelector('.createAccount-button').addEventListener('click', (e) => {
  e.preventDefault();
  signUpUserEmailPassword();
  console.log('create account button clicked');
});

document.querySelector('.signOut-button').addEventListener('click', logoutUser);

export { auth, db }