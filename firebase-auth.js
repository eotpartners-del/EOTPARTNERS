// ==================== نظام المصادقة مع Firebase Authentication ====================

// تهيئة Firebase Auth
const auth = firebase.auth();

// تسجيل مستخدم جديد
async function registerUser(fullName, email, password, refCode) {
  try {
    // إنشاء حساب في Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    // إنشاء رمز دعوة فريد
    const newRefCode = 'EOT' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // حفظ بيانات إضافية في Firestore
    const userData = {
      fullName: fullName,
      email: email,
      refCode: newRefCode,
      referredBy: refCode || null,
      joinDate: new Date().toISOString(),
      balance: {
        totalUSDT: 0,
        totalInvested: 0,
        totalProfit: 0
      }
    };

    await db.collection('users').doc(userId).set(userData);

    // تحديث عداد الإحالات
    if (refCode) {
      const refQuery = await db.collection('users').where('refCode', '==', refCode).get();
      if (!refQuery.empty) {
        const referrerDoc = refQuery.docs[0];
        const referrals = referrerDoc.data().referrals || [];
        referrals.push({
          name: fullName,
          date: new Date().toISOString()
        });
        await db.collection('users').doc(referrerDoc.id).update({ referrals: referrals });
      }
    }

    return { success: true, userId: userId, refCode: newRefCode };
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, message: 'هذا البريد مسجل مسبقًا' };
    }
    return { success: false, message: 'حدث خطأ أثناء التسجيل' };
  }
}

// تسجيل الدخول
async function loginUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      userData.id = userId;
      return { success: true, user: userData };
    }

    return { success: false, message: 'بيانات المستخدم غير موجودة' };
  } catch (error) {
    console.error('خطأ في الدخول:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
  }
}