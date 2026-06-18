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
      @go-to-dashboard="currentView = 'admin'" 
    />
    
    <AdminDashboard 
      v-else-if="currentView === 'admin'" 
      @logout="logout" 
      @go-to-cashier="currentView = 'cashier'" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import PosCashier from './components/PosCashier.vue';
import AdminDashboard from './components/AdminDashboard.vue';

const currentView = ref('login'); // login | register | cashier | admin

const checkSession = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
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
  if (user && user.role === 'admin') {
    currentView.value = 'admin';
  } else {
    currentView.value = 'cashier';
  }
};

const handleRegisterSuccess = () => {
  currentView.value = 'login';
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
