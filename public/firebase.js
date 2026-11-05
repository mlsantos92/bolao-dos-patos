/*
 * Ponte para o Firebase.
 *
 * Com o arquivo firebase-config.js (veja firebase-config.example.js), o app usa
 * o Firebase de verdade: login com Google e banco Firestore.
 * Sem ele (como neste repositório público), carrega demo-firebase.js, que imita
 * as mesmas funções com dados fictícios guardados só no navegador.
 */
let config = null;
try { ({ firebaseConfig: config } = await import("./firebase-config.js")); } catch (e) { config = null; }

const V = "10.12.2", CDN = `https://www.gstatic.com/firebasejs/${V}/`;
const api = config
  ? Object.assign({}, await import(CDN + "firebase-app.js"), await import(CDN + "firebase-auth.js"), await import(CDN + "firebase-firestore.js"))
  : await import("./demo-firebase.js");

export const firebaseConfig = config || { demo: true };
export const {
  initializeApp, getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut,
  getFirestore, doc, getDoc, getDocs, setDoc, collection, query, where, onSnapshot, writeBatch, deleteDoc, updateDoc,
  serverTimestamp, Timestamp,
} = api;
