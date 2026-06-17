<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
    <!-- Main POS body -->
    <div class="w-full md:w-2/3 p-4 md:p-6 flex flex-col h-screen overflow-hidden">
      <header class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Warteg.co POS</h1>
          <p class="text-sm text-gray-500">Petugas: <span class="font-semibold text-green-800">{{ currentUser.name || 'Kasir' }}</span> ({{ currentUser.role || 'cashier' }})</p>
        </div>
        <div class="flex items-center gap-3">
          <button v-if="currentUser.role === 'admin'" @click="$emit('go-to-dashboard')" class="bg-green-50 text-green-800 hover:bg-green-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
            <span>📊</span> Dashboard
          </button>
          <button @click="$emit('logout')" class="text-red-500 text-sm font-semibold hover:underline cursor-pointer">Keluar</button>
        </div>
      </header>

      <!-- Category Filter -->
      <div class="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide shrink-0">
        <button v-for="cat in categories" :key="cat" 
          @click="activeCategory = cat"
          :class="['px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors cursor-pointer', 
            activeCategory === cat ? 'bg-green-800 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50']">
          {{ cat }}
        </button>
      </div>

      <!-- Menu Grid -->
      <div class="flex-1 overflow-y-auto pr-2 pb-24 md:pb-4">
        <div v-if="isLoading" class="flex flex-col items-center justify-center h-48 text-gray-500">
          <span class="animate-spin text-3xl mb-2">⏳</span>
          <p class="text-sm font-medium">Memuat menu makanan...</p>
        </div>
        
        <div v-else-if="filteredMenu.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-400">
          <p class="text-sm font-medium">Tidak ada lauk tersedia di kategori ini.</p>
        </div>

        <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in filteredMenu" :key="item.id" @click="addToCart(item)" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group">
            <div class="h-32 bg-gray-200 overflow-hidden relative">
              <img :src="item.image" alt="Food" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute top-2 right-2 bg-green-800 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                {{ item.category }}
              </div>
            </div>
            <div class="p-3">
              <h3 class="font-bold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-green-800 transition-colors">{{ item.name }}</h3>
              <p class="text-green-700 font-semibold text-sm">Rp {{ item.price.toLocaleString('id-ID') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side Cart Drawer -->
    <div class="w-full md:w-1/3 bg-white border-l border-gray-200 shadow-xl md:shadow-none fixed md:relative bottom-0 md:bottom-auto h-[60vh] md:h-screen flex flex-col rounded-t-3xl md:rounded-none z-50 transform transition-transform duration-300" 
         :class="{'translate-y-full md:translate-y-0': !isCartOpen && isMobile}">
      
      <div class="md:hidden flex justify-center p-2 bg-gray-100 rounded-t-3xl cursor-pointer" @click="isCartOpen = !isCartOpen">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <div class="p-6 flex-1 flex flex-col h-full overflow-hidden">
        <h2 class="text-xl font-bold mb-4 flex justify-between items-center shrink-0">
          <span>Pesanan Baru</span>
          <span class="text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-md font-semibold">
            {{ totalPortions }} Porsi
          </span>
        </h2>
        
        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-2">
          <div v-if="cart.length === 0" class="text-center text-gray-400 mt-10 text-sm">
            Belum ada pesanan
          </div>
          <div v-for="(cartItem, index) in cart" :key="index" class="flex justify-between items-center border-b border-gray-100 pb-3">
            <div class="w-1/2">
              <h4 class="font-semibold text-sm text-gray-800 line-clamp-1">{{ cartItem.name }}</h4>
              <p class="text-xs text-gray-500">Rp {{ cartItem.price.toLocaleString('id-ID') }}</p>
            </div>
            
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button @click="updateQty(index, -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 font-bold hover:bg-white rounded cursor-pointer">-</button>
              <span class="w-8 text-center text-sm font-semibold">{{ cartItem.qty }}</span>
              <button @click="updateQty(index, 1)" class="w-6 h-6 flex items-center justify-center text-gray-600 font-bold hover:bg-white rounded cursor-pointer">+</button>
            </div>
          </div>
        </div>

        <!-- Checkout Section -->
        <div class="border-t border-gray-200 pt-4 mt-4 space-y-2 shrink-0">
          <div class="flex justify-between text-gray-500 text-sm">
            <span>Sub-Total</span>
            <span>Rp {{ subtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg text-gray-800">
            <span>Total</span>
            <span class="text-green-800">Rp {{ subtotal.toLocaleString('id-ID') }}</span>
          </div>
          <button @click="payNow" :disabled="cart.length === 0 || isSubmitting" 
            class="w-full mt-4 bg-green-800 disabled:bg-gray-400 hover:bg-green-900 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-green-900/10">
            {{ isSubmitting ? 'MEMPROSES...' : 'BAYAR SEKARANG' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Mobile Drawer Toggle -->
    <button v-if="!isCartOpen && isMobile" @click="isCartOpen = true" class="md:hidden fixed bottom-6 right-6 bg-green-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold z-40 cursor-pointer">
      <span>🛍️</span>
      <span v-if="cart.length > 0">{{ cart.length }} Item ({{ totalPortions }} Porsi)</span>
      <span v-else>Lihat Keranjang</span>
    </button>

    <!-- Beautiful Success Payment Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center">
        <div class="w-16 h-16 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
          ✓
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-1">Pembayaran Berhasil!</h3>
        <p class="text-xs text-gray-400 mb-4">Transaksi #{{ lastTransaction.id || 'N/A' }} telah dicatat ke database</p>
        
        <!-- Receipt Summary -->
        <div class="bg-gray-50 rounded-2xl p-4 text-left text-sm mb-5 space-y-2.5 max-h-56 overflow-y-auto">
          <div class="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200/50 pb-1.5">
            <span>Rincian Item</span>
            <span>Subtotal</span>
          </div>
          <div class="divide-y divide-gray-200/30 space-y-2">
            <div v-for="item in lastTransaction.items" :key="item.name" class="flex justify-between pt-2">
              <span class="font-semibold text-gray-800 text-xs truncate max-w-[200px]">{{ item.name }} (x{{ item.qty }})</span>
              <span class="font-bold text-gray-800 text-xs shrink-0">Rp {{ (item.price * item.qty).toLocaleString('id-ID') }}</span>
            </div>
          </div>
          <div class="border-t border-gray-200/50 pt-3 flex justify-between font-bold text-gray-800">
            <span>Total Bayar</span>
            <span class="text-green-800">Rp {{ lastTransaction.total?.toLocaleString('id-ID') }}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <button @click="showSuccessModal = false" class="py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
            Tutup
          </button>
          <button @click="printReceipt" class="py-3 text-xs font-bold text-white bg-green-800 hover:bg-green-900 rounded-xl shadow-md shadow-green-800/10 cursor-pointer transition-colors">
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { api } from '../services/api';

const emit = defineEmits(['logout', 'go-to-dashboard']);

const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const showSuccessModal = ref(false);
const lastTransaction = ref({});
const menuItems = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);

const activeCategory = ref('All Side Dishes');

// Load Menus from backend
const fetchMenus = async () => {
  isLoading.value = true;
  try {
    const data = await api.menus.getAll();
    menuItems.value = data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.categories ? item.categories.name : 'Lain-lain',
      image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
      available: item.is_available
    }));
  } catch (error) {
    alert('Gagal mengambil data menu dari server.');
  } finally {
    isLoading.value = false;
  }
};

// Compute categories list based on existing foods
const categories = computed(() => {
  const list = new Set(menuItems.value.map(item => item.category));
  return ['All Side Dishes', ...list];
});

// Cart Logic
const cart = ref([]);
const isCartOpen = ref(false); // For Mobile Bottom Sheet

const filteredMenu = computed(() => {
  // Only display menus that are active/available
  const items = menuItems.value.filter(item => item.available);
  if (activeCategory.value === 'All Side Dishes') return items;
  return items.filter(item => item.category === activeCategory.value);
});

const addToCart = (item) => {
  const existingItem = cart.value.find(c => c.id === item.id);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.value.push({ ...item, qty: 1 });
  }
  
  if (isMobile.value) {
    isCartOpen.value = true;
  }
};

const updateQty = (index, amount) => {
  cart.value[index].qty += amount;
  if (cart.value[index].qty <= 0) {
    cart.value.splice(index, 1);
  }
};

const subtotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.qty), 0);
});

const totalPortions = computed(() => {
  return cart.value.reduce((total, item) => total + item.qty, 0);
});

const payNow = async () => {
  if (cart.value.length === 0) return;
  
  isSubmitting.value = true;
  try {
    const txData = {
      user_id: currentUser.value.id || null,
      total_items: cart.value.length,
      total_portions: totalPortions.value,
      total_amount: subtotal.value,
      cart_items: cart.value.map(item => ({
        menu_id: item.id,
        price: item.price,
        quantity: item.qty,
        subtotal: item.price * item.qty
      }))
    };

    const res = await api.transactions.create(txData);
    
    // Store data for the receipt popup
    lastTransaction.value = {
      id: res.transaction_id || 'N/A',
      total: subtotal.value,
      portions: totalPortions.value,
      items: cart.value.map(item => ({ name: item.name, qty: item.qty, price: item.price }))
    };
    
    showSuccessModal.value = true;
    
    // Reset Cart
    cart.value = [];
    isCartOpen.value = false;
  } catch (error) {
    alert(error.message || 'Gagal menyimpan transaksi ke database.');
  } finally {
    isSubmitting.value = false;
  }
};

const printReceipt = () => {
  alert(`Simulasi mencetak struk belanja...\nTransaksi #${lastTransaction.value.id}\nLauk Terjual: ${lastTransaction.value.portions} Porsi\nTotal: Rp ${lastTransaction.value.total?.toLocaleString('id-ID')}\nPrinter POS: Mencetak Struk Termal...`);
};

// Screen size detection for Mobile bottom sheet UI
const isMobile = ref(false);
const checkScreen = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  fetchMenus();
  checkScreen();
  window.addEventListener('resize', checkScreen);
});

onUnmounted(() => window.removeEventListener('resize', checkScreen));
</script>

<style scoped>
/* Scrollbar hiding utilities */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>