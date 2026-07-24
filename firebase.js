import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuao22pggy_16XquHR0361RKOvMjx-7Aw",
  authDomain: "handball-stats-hub-fbfe2.firebaseapp.com",
  projectId: "handball-stats-hub-fbfe2",
  storageBucket: "handball-stats-hub-fbfe2.firebasestorage.app",
  messagingSenderId: "863014841100",
  appId: "1:863014841100:web:db81c0a5633e7e28fe7729"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.loginWithGoogle = async function () {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google login error:", error);
    alert("Googleログインに失敗しました。\n" + error.message);
  }
};

window.logout = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
};

onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("googleLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "";
  } else {
    if (loginBtn) loginBtn.style.display = "";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
