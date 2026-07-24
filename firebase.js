import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyDuao22pggy_16XquHR0361RKOvMjx-7Aw",
  authDomain: "handball-stats-hub-fbfe2.firebaseapp.com",
  projectId: "handball-stats-hub-fbfe2",
  storageBucket: "handball-stats-hub-fbfe2.firebasestorage.app",
  messagingSenderId: "863014841100",
  appId: "1:863014841100:web:db81c0a5633e7e28fe7729"
};


/* =========================
   INITIALIZE
========================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================
   GOOGLE LOGIN
========================= */

window.loginWithGoogle = async function () {

  const provider = new GoogleAuthProvider();

  try {

    await signInWithPopup(
      auth,
      provider
    );

  } catch (error) {

    console.error(
      "Google login error:",
      error
    );

    alert(
      "Googleログインに失敗しました。\n" +
      error.message
    );

  }

};


/* =========================
   LOGOUT
========================= */

window.logout = async function () {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

};


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
  auth,
  (user) => {

    const loginBtn =
      document.getElementById(
        "googleLoginBtn"
      );

    const logoutBtn =
      document.getElementById(
        "logoutBtn"
      );

    const userInfo =
      document.getElementById(
        "userInfo"
      );


    if (user) {

      if (loginBtn) {
        loginBtn.style.display = "none";
      }

      if (logoutBtn) {
        logoutBtn.style.display = "";
      }

      if (userInfo) {

        userInfo.textContent =
          user.displayName ||
          user.email ||
          "";

      }

      console.log(
        "Logged in:",
        user.uid
      );

      // ログイン後、クラウドの試合データを読み込む
setTimeout(async () => {
  if (window.loadMatchesFromCloud) {
    const cloudMatches =
      await window.loadMatchesFromCloud();

    window.dispatchEvent(
      new CustomEvent(
        "cloudMatchesReady",
        {
          detail: cloudMatches
        }
      )
    );
  }
}, 500);

    } else {

      if (loginBtn) {
        loginBtn.style.display = "";
      }

      if (logoutBtn) {
        logoutBtn.style.display = "none";
      }

      if (userInfo) {
        userInfo.textContent = "";
      }

    }

  }
);


/* =========================
   CLOUD SAVE
========================= */

window.saveMatchToCloud =
async function (matchData) {

  const user =
    auth.currentUser;

  if (!user) {

    console.log(
      "Not logged in."
    );

    return false;

  }


  try {

    const matchId =
      String(
        matchData.id ||
        Date.now()
      );


    await setDoc(

      doc(
        db,
        "users",
        user.uid,
        "matches",
        matchId
      ),

      {
        ...matchData,

        id: matchId,

        updatedAt:
          new Date().toISOString()
      }

    );


    console.log(
      "Cloud save successful:",
      matchId
    );

    return true;


  } catch (error) {

    console.error(
      "Cloud save error:",
      error
    );

    return false;

  }

};


/* =========================
   CLOUD LOAD
========================= */

window.loadMatchesFromCloud =
async function () {

  const user =
    auth.currentUser;


  if (!user) {

    return [];

  }


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "users",
          user.uid,
          "matches"
        )

      );


    const matches = [];


    snapshot.forEach(
      (documentSnapshot) => {

        matches.push(
          documentSnapshot.data()
        );

      }
    );


    matches.sort(
      (a, b) => {

        return (
          Number(b.id || 0) -
          Number(a.id || 0)
        );

      }
    );


    console.log(
      "Cloud load successful:",
      matches.length
    );


    return matches;


  } catch (error) {

    console.error(
      "Cloud load error:",
      error
    );

    return [];

  }

};
