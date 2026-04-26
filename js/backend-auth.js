import { auth, dbFirestore as db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.currentUserUid = null;

// ==========================================
// 🔐 ระบบตรวจสอบสถานะล็อกอิน (Auth State)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (!user) {

        window.location.replace('login.html');
    } else {
        window.currentUserUid = user.uid; 
        const userRef = doc(db, "users", user.uid);
        
        onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const localSession = localStorage.getItem('currentSessionId');

                if (!data.allowMultiSession && localSession && data.currentSessionId && data.currentSessionId !== localSession) {
                    alert("⚠️ มีการเข้าสู่ระบบจากอุปกรณ์อื่น กำลังออกจากระบบ...");
                    await signOut(auth);
                    window.location.replace('login.html');
                    return;
                }

                const now = new Date();
                const expiryDate = (data.expiredAt && typeof data.expiredAt.toDate === 'function') 
                                   ? data.expiredAt.toDate() 
                                   : new Date(data.expiredAt);

                if (data.status !== 'active' || now > expiryDate) {
                    alert("⚠️ บัญชีของคุณหมดอายุ หรือถูกระงับการใช้งาน");
                    await signOut(auth);
                    window.location.replace('login.html');
                    return;
                }

                const diffMs = expiryDate - now;
                const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
                const diffHours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                
                const timeLeftElem = document.getElementById('timeLeftDisplay');
                if(timeLeftElem) {
                    timeLeftElem.innerText = `${diffDays} วัน ${diffHours} ชม.`;
                }
                
                document.body.style.display = 'block';
            } else {
                await signOut(auth);
                window.location.replace('login.html');
            }
        });
    }
});

window.logoutApp = () => {
    signOut(auth).then(() => {
        localStorage.removeItem('currentSessionId');
        window.location.replace('login.html');
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
};

// ==========================================
// ☁️ ระบบบันทึก / โหลด รายการโปรด (Save to Cloud)
// ==========================================
window.saveFavoriteToCloud = async function() {
    if (!window.currentUserUid) {
        alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการบันทึก");
        return;
    }
    
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 
    
    const favData = {
        noteMode: document.getElementById('modeSwitch')?.checked || false,
        noteText: document.getElementById('AideMemoire')?.value || '',
        bgNote: document.getElementById('bg_note')?.value || '',
        sName: document.getElementById('sendername')?.value || '',
        sAccount: document.getElementById('senderaccount')?.value || '',
        rName: document.getElementById('receivername')?.value || '',
        rAccount: document.getElementById('receiveraccount')?.value || '',
        bank: document.getElementById('bank')?.value || '',
        amount: document.getElementById('amount11')?.value || '',
        sticker: document.getElementById('imageSelect')?.value || '',
        bgNormal: document.getElementById('backgroundSelect')?.value || '',
        
        // ข้อมูลส่วนเพิ่มเติมสำหรับหน้าแจ้งเตือนเงินเข้า (Notify)
        money01: document.getElementById('money01')?.value || '',
        money02: document.getElementById('money02')?.value || '',
        sAcc1: document.getElementById('senderaccount1')?.value || '',
        sAcc2: document.getElementById('senderaccount2')?.value || '',
        mMy: document.getElementById('monthmonthyear')?.value || '',
        may: document.getElementById('monthandyear')?.value || '',
        name1: document.getElementById('name1')?.value || '',
        nametext1: document.getElementById('nametext1')?.value || '',
        text1: document.getElementById('text1')?.value || ''
    };

    try {
        const userRef = doc(db, "users", window.currentUserUid);
        const updateData = {};
        updateData[`slipFav_${bankKey}`] = favData;
        
        await setDoc(userRef, updateData, { merge: true });
        
        alert("✅ บันทึกรายการโปรดเรียบร้อยแล้ว!");
    } catch (error) {
        console.error("Error saving to cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองใหม่อีกครั้ง");
    }
};

window.loadFavoriteFromCloud = async function() {
    if (!window.currentUserUid) {
        alert("⚠️ กรุณาเข้าสู่ระบบก่อนทำการโหลดข้อมูล");
        return;
    }
    
    const bankKey = window.CURRENT_BANK || 'GENERAL'; 

    try {
        const userRef = doc(db, "users", window.currentUserUid);
        const docSnap = await getDoc(userRef);
        const favKey = `slipFav_${bankKey}`;
        
        if (docSnap.exists() && docSnap.data()[favKey]) {
            const favData = docSnap.data()[favKey];
            
            // โหลดข้อมูลกลับใส่ Input
            if(favData.noteMode !== undefined && document.getElementById('modeSwitch')) {
                document.getElementById('modeSwitch').checked = favData.noteMode;
                if(typeof toggleMode === 'function') toggleMode();
            }
            if(favData.noteText !== undefined && document.getElementById('AideMemoire')) document.getElementById('AideMemoire').value = favData.noteText;
            if(favData.bgNote !== undefined && document.getElementById('bg_note')) document.getElementById('bg_note').value = favData.bgNote;
            if(favData.sName !== undefined && document.getElementById('sendername')) document.getElementById('sendername').value = favData.sName;
            if(favData.sAccount !== undefined && document.getElementById('senderaccount')) document.getElementById('senderaccount').value = favData.sAccount;
            if(favData.rName !== undefined && document.getElementById('receivername')) document.getElementById('receivername').value = favData.rName;
            if(favData.rAccount !== undefined && document.getElementById('receiveraccount')) document.getElementById('receiveraccount').value = favData.rAccount;
            if(favData.bank !== undefined && document.getElementById('bank')) document.getElementById('bank').value = favData.bank;
            if(favData.amount !== undefined && document.getElementById('amount11')) document.getElementById('amount11').value = favData.amount;
            if(favData.sticker !== undefined && document.getElementById('imageSelect')) document.getElementById('imageSelect').value = favData.sticker;
            if(favData.bgNormal !== undefined && document.getElementById('backgroundSelect')) document.getElementById('backgroundSelect').value = favData.bgNormal;

            // โหลดข้อมูลส่วนของหน้าแจ้งเตือนเงินเข้า
            if(favData.money01 !== undefined && document.getElementById('money01')) document.getElementById('money01').value = favData.money01;
            if(favData.money02 !== undefined && document.getElementById('money02')) document.getElementById('money02').value = favData.money02;
            if(favData.sAcc1 !== undefined && document.getElementById('senderaccount1')) document.getElementById('senderaccount1').value = favData.sAcc1;
            if(favData.sAcc2 !== undefined && document.getElementById('senderaccount2')) document.getElementById('senderaccount2').value = favData.sAcc2;
            if(favData.mMy !== undefined && document.getElementById('monthmonthyear')) document.getElementById('monthmonthyear').value = favData.mMy;
            if(favData.may !== undefined && document.getElementById('monthandyear')) document.getElementById('monthandyear').value = favData.may;
            if(favData.name1 !== undefined && document.getElementById('name1')) document.getElementById('name1').value = favData.name1;
            if(favData.nametext1 !== undefined && document.getElementById('nametext1')) document.getElementById('nametext1').value = favData.nametext1;
            if(favData.text1 !== undefined && document.getElementById('text1')) document.getElementById('text1').value = favData.text1;
            
            // อัปเดต Canvas ทันทีหลังจากโหลดข้อมูลเสร็จ
            if(typeof window.triggerUpdate === 'function') window.triggerUpdate();
            if(typeof window.updateDisplay === 'function') window.updateDisplay();
            
        } else {
            alert("⚠️ ยังไม่ได้บันทึกรายการโปรดสำหรับรูปแบบนี้");
        }
    } catch (error) {
        console.error("Error loading from cloud:", error);
        alert("❌ เกิดข้อผิดพลาดในการดึงข้อมูล");
    }
};