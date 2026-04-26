import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyARW02U4K0Ucx9Eq8IWfeR6pVMerfo0v7A",
    authDomain: "slip-premium-app.firebaseapp.com",
    projectId: "slip-premium-app",
    storageBucket: "slip-premium-app.firebasestorage.app",
    messagingSenderId: "217644633711",
    appId: "1:217644633711:web:645b3e0fa46d2232fbc79a"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const dbFirestore = getFirestore(app); 
export const dbRealtime = getDatabase(app); 

window.saveSlipToFirebase = async (bankName, slipData) => {
    try {
        const dbRef = ref(dbRealtime, `slip_logs/${bankName}`);
        await push(dbRef, {
            ...slipData,
            timestamp: new Date().toISOString()
        });
        console.log(`✅ บันทึกข้อมูลของ ${bankName} สำเร็จ`);
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึก:", error);
    }
};