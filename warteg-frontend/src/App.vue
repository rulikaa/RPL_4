<template>
  <div class="font-sans text-gray-800 bg-gray-100 min-h-screen">
    <!-- View Switcher based on currentView -->
    <Login 
      v-if="currentView === 'login'" 
      @login-success="handleLoginSuccess" 
      @go-to-register="currentView = 'register'" 
    />
    
    <Register 
      v-else-if="currentView === 'register'" 
      @go-to-login="currentView = 'login'" 
      @register-success="handleRegisterSuccess" 
    />
    
    <PosCashier 
      v-else-if="currentView === 'cashier'" 
      @logout="logout" 
      @go-to-dashboard="goToDashboard" 
    />
    
    <AdminDashboard 
      v-else-if="currentView === 'admin'" 
      @logout="logout" 
      @go-to-cashier="goToCashier" 
    />
    <!-- Pending Verification View -->
    <div v-else-if="currentView === 'pending-verification'" class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center border border-gray-100 relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-24 h-24 bg-amber-500/5 rounded-full blur-xl"></div>
        <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
          ⚠️
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2">Akun Belum Aktif</h3>
        <p class="text-sm text-gray-500 mb-6 leading-relaxed">
          Halo, <span class="font-bold text-green-800">{{ currentUser.name || 'Kasir' }}</span>. Akun Anda berhasil didaftarkan, tetapi **belum diverifikasi** oleh Pemilik Warteg. 
          Silakan hubungi pemilik warteg untuk mengaktifkan akun Anda.
        </p>
        <div class="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-left text-xs text-amber-800 mb-6 flex gap-2">
          <span>ℹ️</span>
          <span>Setelah Pemilik menyetujui akun Anda, Anda akan dialihkan ke layar kasir POS saat menyegarkan halaman.</span>
        </div>
        <button @click="logout" class="w-full py-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer">
          Keluar / Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from './services/api';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import PosCashier from './components/PosCashier.vue';
import AdminDashboard from './components/AdminDashboard.vue';

const currentView = ref('login'); // login | register | cashier | admin | pending-verification
const currentUser = ref({});

const checkSession = async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      let user = JSON.parse(userStr);
      currentUser.value = user;

      // Query database for latest profile status
      try {
        const freshData = await api.auth.me();
        if (freshData && freshData.user) {
          user = freshData.user;
          currentUser.value = user;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (meErr) {
        console.warn('Fallback: Using local session storage details.', meErr.message);
      }

      if (user.is_verified === false) {
        currentView.value = 'pending-verification';
        return;
      }

      if (user.role === 'admin') {
        currentView.value = 'admin';
      } else {
        currentView.value = 'cashier';
      }
    } catch (e) {
      localStorage.clear();
      currentView.value = 'login';
    }
  } else {
    currentView.value = 'login';
  }
};

const handleLoginSuccess = (user) => {
  currentUser.value = user;
  if (user && user.is_verified === false) {
    currentView.value = 'pending-verification';
  } else if (user && user.role === 'admin') {
    currentView.value = 'admin';
  } else {
    currentView.value = 'cashier';
  }
};

const handleRegisterSuccess = () => {
  currentView.value = 'login';
};

const goToDashboard = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        currentView.value = 'admin';
        return;
      }
    } catch (e) {
      console.error('Session error:', e);
    }
  }
  logout();
};

const goToCashier = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        currentView.value = 'cashier';
        return;
      }
    } catch (e) {
      console.error('Session error:', e);
    }
  }
  logout();
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentView.value = 'login';
};

onMounted(() => {
  checkSession();
});
</script>
