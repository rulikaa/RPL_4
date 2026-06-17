<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="flex flex-col-reverse md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-5xl h-auto md:h-[600px]">
      
      <!-- Left side info box -->
      <div class="w-full md:w-5/12 bg-green-900 text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-green-800 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
        
        <div class="relative z-10">
          <h1 class="text-3xl font-bold mb-4 leading-tight">Mulai Digitalisasi Warteg<br>Anda Sekarang.</h1>
          <p class="text-green-100 text-sm leading-relaxed mb-8">
            Daftarkan akun admin warteg Anda untuk mengelola menu harian, mencatat transaksi penjualan otomatis, dan melihat rekap pendapatan secara terpusat tanpa repot.
          </p>
          <div class="bg-green-800/50 border border-green-700 p-4 rounded-xl inline-block">
            <p class="text-xs uppercase font-bold text-green-300 mb-1">Terbuka Untuk</p>
            <p class="font-semibold">Pemilik & Internal Warteg</p>
          </div>
        </div>
      </div>

      <!-- Right side Registration form -->
      <div class="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">Daftar Akun Baru</h2>
          <p class="text-gray-500 text-sm">Kelola bisnis warteg konvensional menjadi serba digital dan modern.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div v-if="errorMessage" class="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-lg text-xs font-semibold">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="bg-green-50 text-green-700 border border-green-100 px-4 py-3 rounded-lg text-xs font-semibold">
            {{ successMessage }}
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Nama Lengkap Pemilik</label>
            <input type="text" v-model="form.name" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Contoh: Budi Santoso" required />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Username Baru</label>
            <input type="text" v-model="form.username" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Masukkan nama pengguna unik" required />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Role Akun (Hak Akses)</label>
            <div class="grid grid-cols-2 gap-2 mt-1 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button type="button" @click="form.role = 'admin'" :class="['py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5', form.role === 'admin' ? 'bg-green-800 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800']">
                💼 Pemilik (Admin)
              </button>
              <button type="button" @click="form.role = 'cashier'" :class="['py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5', form.role === 'cashier' ? 'bg-green-800 text-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800']">
                🧑‍🍳 Karyawan (Kasir)
              </button>
            </div>
          </div>
          
          <div class="flex gap-4 flex-col md:flex-row">
            <div class="w-full">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Kata Sandi</label>
              <input type="password" v-model="form.password" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Minimal 8 karakter" required />
            </div>
            <div class="w-full">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Konfirmasi Kata Sandi</label>
              <input type="password" v-model="form.confirmPassword" class="w-full border-b-2 border-gray-200 focus:border-green-700 outline-none py-2 transition-colors bg-transparent" placeholder="Ulangi kata sandi Anda" required />
            </div>
          </div>
          
          <button type="submit" :disabled="isLoading" class="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-6 shadow-lg shadow-gray-900/30 cursor-pointer">
            {{ isLoading ? 'MENDAFTARKAN...' : 'BUAT AKUN ADMIN' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            Sudah terdaftar? 
            <button @click="$emit('go-to-login')" class="text-green-700 font-bold hover:underline cursor-pointer">Masuk Sekarang</button>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { api } from '../services/api';

const emit = defineEmits(['go-to-login', 'register-success']);

const form = reactive({
  name: '',
  username: '',
  role: 'admin',
  password: '',
  confirmPassword: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleRegister = async () => {
  if (form.password.length < 8) {
    errorMessage.value = 'Kata sandi minimal harus 8 karakter!';
    return;
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Kata sandi tidak cocok!';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await api.auth.register(form.name, form.username, form.password, form.role);
    successMessage.value = 'Registrasi berhasil! Mengalihkan ke halaman login...';
    setTimeout(() => {
      emit('register-success');
    }, 1500);
  } catch (error) {
    errorMessage.value = error.message || 'Pendaftaran gagal';
  } finally {
    isLoading.value = false;
  }
};
</script>