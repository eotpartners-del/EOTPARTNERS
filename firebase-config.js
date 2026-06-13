// ==================== إعدادات Firebase ====================
const firebaseConfig = {
  apiKey: "AIzaSyAs8gK-gPZTpZRvM-BAEwOPFuBGd-aDRII",
  authDomain: "eot-partners.firebaseapp.com",
  projectId: "eot-partners",
  storageBucket: "eot-partners.firebasestorage.app",
  messagingSenderId: "536826579313",
  appId: "1:536826579313:web:8fefea6ae0dd5c9c8f8ed0",
  measurementId: "G-PYGXT52VTW"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// تفعيل Firestore
const db = firebase.firestore();

console.log('✅ Firebase جاهز للعمل');