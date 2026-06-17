<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl h-auto md:h-[600px]">
      
      <!-- Left side image/brand banner -->
      <div class="hidden md:flex md:w-1/2 relative bg-gray-900 items-end p-8" style="background-image: url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1000&auto=format&fit=crop'); background-size: cover; background-position: center;">
        <div class="absolute inset-0 bg-black/30"></div>
        <div class="relative z-10 text-white bg-white/20 backdrop-blur-md p-6 rounded-xl border border-white/30 w-full">
          <h2 class="text-2xl font-bold mb-1">Authentic Taste.</h2>
          <p class="text-sm font-light">Integrated Cashier System</p>
        </div>
      </div>

      <!-- Right side Login form -->
      <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">WELCOME.</h1>
          <p class="text-gray-500 text-sm">Log in to proceed to the cashier system.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div v-if="errorMessage" class="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-lg text-xs font-semibold">
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Email address / Username</label>
            <input type="text" v-model="username" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Masukkan username" required />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Password</label>
            <input type="password" v-model="password" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Masukkan kata sandi" required />
          </div>
          
          <button type="submit" :disabled="isLoading" class="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-lg shadow-green-950/20 cursor-pointer">
            {{ isLoading ? 'LOGGING IN...' : 'SIGN IN NOW' }}
          </button>
        </form>

        <div class="mt-8 text-center space-y-2">
          <p class="text-xs text-gray-400 font-semibold uppercase">Khusus Internal Pemilik Warteg</p>
          <button @click="$emit('go-to-register')" class="text-xs text-green-700 font-bold hover:underline cursor-pointer block mx-auto">
            DAFTAR AKUN BARU
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '../services/api';

const emit = defineEmits(['login-success', 'go-to-register']);
const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const data = await api.auth.login(username.value, password.value);
    
    // Save to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Emit success event with user details
    emit('login-success', data.user);
  } catch (error) {
    errorMessage.value = error.message || 'Username atau password salah';
  } finally {
    isLoading.value = false;
  }
};
</script>