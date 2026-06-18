<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
    
    <!-- Sidebar Navigation -->
    <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen p-6 shrink-0">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800">Warteg.co <span class="text-green-700 text-xs font-bold px-2 py-0.5 bg-green-50 rounded-md">ADMIN</span></h1>
      </div>
      <nav class="space-y-2 flex-1">
        <button @click="activeTab = 'dashboard'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer', activeTab === 'dashboard' ? 'bg-green-800 text-white shadow-md shadow-green-800/20' : 'text-gray-500 hover:bg-gray-50']">
          <span>📊</span> Dashboard
        </button>
        <button @click="activeTab = 'menu'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer', activeTab === 'menu' ? 'bg-green-800 text-white shadow-md shadow-green-800/20' : 'text-gray-500 hover:bg-gray-50']">
          <span>🍲</span> Manajemen Lauk
        </button>
        <button @click="activeTab = 'transactions'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer', activeTab === 'transactions' ? 'bg-green-800 text-white shadow-md shadow-green-800/20' : 'text-gray-500 hover:bg-gray-50']">
          <span>🧾</span> Catatan Transaksi
        </button>
        <button @click="activeTab = 'users'" :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer', activeTab === 'users' ? 'bg-green-800 text-white shadow-md shadow-green-800/20' : 'text-gray-500 hover:bg-gray-50']">
          <span>👥</span> Validasi Akun
        </button>
      </nav>
      <div class="mt-auto border-t border-gray-100 pt-4 space-y-1">
        <button @click="$emit('go-to-cashier')" class="w-full text-left px-4 py-3 text-green-800 font-bold hover:bg-green-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
          <span>📺</span> Buka POS Kasir
        </button>
        <button @click="$emit('logout')" class="w-full text-left px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
          <span>➔</span> Keluar / Logout
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <!-- Top Header -->
      <header class="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm shrink-0">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ pageTitle }}</h2>
          <p class="text-xs text-gray-500 hidden md:block mt-0.5">{{ pageSubtitle }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="font-bold text-sm text-gray-800">{{ todayFormatted }}</p>
            <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pemilik Warteg: {{ currentUser.name || 'Admin' }}</p>
          </div>
          <div class="w-10 h-10 bg-gradient-to-tr from-green-700 to-green-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">
            {{ currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A' }}
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        
        <!-- Global Loading Indicator -->
        <div v-if="isLoadingData" class="flex flex-col items-center justify-center h-64 text-gray-500">
          <span class="animate-spin text-3xl mb-2">⏳</span>
          <p class="text-sm font-medium">Memuat data dari database...</p>
        </div>

        <div v-else>
          <!-- 1. DASHBOARD TAB -->
          <div v-if="activeTab === 'dashboard'" class="space-y-6">
            <!-- Hero Income Card -->
            <div class="bg-gradient-to-br from-green-800 to-green-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
              <p class="text-green-200 font-semibold mb-1 uppercase tracking-wider text-xs">Total Pendapatan Hari Ini</p>
              <h3 class="text-4xl font-black">Rp {{ stats.todayRevenue.toLocaleString('id-ID') }}</h3>
            </div>
            
            <!-- Statistics Quick Row -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <p class="text-gray-400 font-medium text-xs uppercase tracking-wider">Jumlah Transaksi</p>
                <h4 class="text-2xl font-black text-gray-800 mt-2">{{ stats.todayTxCount }} <span class="text-sm font-semibold text-gray-400">Pelanggan</span></h4>
              </div>
              <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <p class="text-gray-400 font-medium text-xs uppercase tracking-wider">Total Lauk Terjual</p>
                <h4 class="text-2xl font-black text-gray-800 mt-2">{{ stats.todayPortions }} <span class="text-sm font-semibold text-gray-400">Porsi</span></h4>
              </div>
            </div>

            <!-- Top Selling & Recent Activity Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Top Selling dishes -->
              <div class="space-y-3">
                <h4 class="font-bold text-gray-900 text-base flex items-center gap-2">🔥 Total Penjualan Lauk Bulan Ini</h4>
                <div v-if="stats.topSelling.length === 0" class="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400 text-sm shadow-sm">
                  Belum ada data penjualan
                </div>
                <div v-else class="space-y-2">
                  <div v-for="(item, index) in stats.topSelling" :key="index" class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-green-50 text-green-800 font-bold rounded-lg flex items-center justify-center text-sm">{{ index + 1 }}</div>
                      <p class="font-bold text-sm text-gray-800">{{ item.name }}</p>
                    </div>
                    <span class="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">{{ item.sold }} Porsi Terjual</span>
                  </div>
                </div>
              </div>

              <!-- Recent transactions -->
              <div class="space-y-3">
                <h4 class="font-bold text-gray-900 text-base flex items-center gap-2">⏱️ Transaksi Terbaru</h4>
                <div v-if="stats.recentTransactions.length === 0" class="bg-white p-6 rounded-xl border border-gray-200 text-center text-gray-400 text-sm shadow-sm">
                  Belum ada transaksi hari ini
                </div>
                <div v-else class="space-y-2">
                  <div v-for="(trx, index) in stats.recentTransactions" :key="index" class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
                    <div>
                      <p class="font-bold text-sm text-gray-800">Rp {{ trx.amount.toLocaleString('id-ID') }}</p>
                      <p class="text-xs text-gray-400">{{ trx.time }}</p>
                    </div>
                    <span class="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">Selesai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. MENU LIST & CRUD TAB -->
          <div v-if="activeTab === 'menu'" class="space-y-6">
            <!-- Filter & Add Button -->
            <div class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
                <button @click="activeCategoryFilter = 'SEMUA'" :class="['px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors', activeCategoryFilter === 'SEMUA' ? 'bg-green-800 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']">SEMUA</button>
                <button @click="activeCategoryFilter = 'Ayam & Ikan'" :class="['px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors', activeCategoryFilter === 'Ayam & Ikan' ? 'bg-green-800 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']">AYAM & IKAN</button>
                <button @click="activeCategoryFilter = 'Sayuran'" :class="['px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors', activeCategoryFilter === 'Sayuran' ? 'bg-green-800 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']">SAYURAN</button>
                <button @click="activeCategoryFilter = 'Gorengan'" :class="['px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors', activeCategoryFilter === 'Gorengan' ? 'bg-green-800 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']">GORENGAN</button>
                <button @click="activeCategoryFilter = 'Lain-lain'" :class="['px-4 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-colors', activeCategoryFilter === 'Lain-lain' ? 'bg-green-800 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']">LAIN-LAIN</button>
              </div>
              <button @click="openAddModal" class="bg-green-800 hover:bg-green-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-800/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                <span>+</span> Tambah Lauk Baru
              </button>
            </div>

            <!-- Desktop Menu Table -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse hidden md:table">
                <thead>
                  <tr class="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                    <th class="p-4">Info Menu</th>
                    <th class="p-4">Kategori</th>
                    <th class="p-4">Harga Porsi</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="menu in filteredMenuList" :key="menu.id" class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td class="p-4 flex items-center gap-3">
                      <img :src="menu.image" class="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-inner" />
                      <span class="font-bold text-sm text-gray-900">{{ menu.name }}</span>
                    </td>
                    <td class="p-4 text-sm text-gray-500 font-medium">{{ menu.category }}</td>
                    <td class="p-4 text-sm font-bold text-gray-900">Rp {{ menu.price.toLocaleString('id-ID') }}</td>
                    <td class="p-4">
                      <span :class="['px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase', menu.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100']">
                        {{ menu.available ? 'Tersedia' : 'Habis' }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex justify-center gap-2">
                        <button @click="openEditModal(menu)" class="text-blue-600 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Edit</button>
                        <button @click="handleDeleteMenu(menu.id)" class="text-red-600 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Hapus</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Mobile Menu List -->
              <div class="md:hidden divide-y divide-gray-100">
                <div v-for="menu in filteredMenuList" :key="menu.id" class="p-4 flex items-center gap-3 hover:bg-gray-50">
                  <img :src="menu.image" class="w-16 h-16 rounded-xl object-cover shadow-inner" />
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm text-gray-900 truncate">{{ menu.name }}</h4>
                    <p class="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{{ menu.category }}</p>
                    <p class="text-sm font-bold text-green-800 mt-0.5">Rp {{ menu.price.toLocaleString('id-ID') }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span :class="['text-[10px] font-bold uppercase tracking-wider', menu.available ? 'text-green-600' : 'text-red-500']">
                      {{ menu.available ? 'Tersedia' : 'Habis' }}
                    </span>
                    <div class="flex gap-1.5">
                      <button @click="openEditModal(menu)" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer">Edit</button>
                      <button @click="handleDeleteMenu(menu.id)" class="bg-red-50 hover:bg-red-100 text-red-500 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer">Hapus</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. TRANSACTION HISTORY TAB -->
          <div v-if="activeTab === 'transactions'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="font-bold text-xs text-gray-400 uppercase tracking-wider">Total Catatan: {{ transactions.length }} Transaksi</p>
              <span class="text-xs bg-white border border-gray-200 px-3 py-1 rounded-md font-semibold text-gray-500 shadow-sm">Semua Waktu</span>
            </div>
            
            <div v-if="transactions.length === 0" class="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-400 text-sm shadow-sm">
              Belum ada riwayat transaksi tersimpan.
            </div>

            <div v-else class="space-y-2.5">
              <div v-for="trx in transactions" :key="trx.id" 
                   @click="openDetailModal(trx)"
                   class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-green-600 hover:shadow-md transition-all group">
                <div>
                  <h4 class="font-black text-base text-gray-900 group-hover:text-green-800 transition-colors">{{ formatDate(trx.transaction_time) }}</h4>
                  <p class="text-xs text-gray-400 font-medium mt-0.5">{{ formatTime(trx.transaction_time) }} - {{ trx.total_items }} Jenis ({{ trx.total_portions }} Porsi)</p>
                </div>
                <div class="flex items-center gap-3">
                  <h4 class="font-black text-base text-gray-800">Rp {{ trx.total_amount.toLocaleString('id-ID') }}</h4>
                  <span class="text-gray-300 group-hover:text-green-700 transform group-hover:translate-x-1 transition-all">➔</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. VALIDASI AKUN TAB -->
          <div v-if="activeTab === 'users'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="font-bold text-xs text-gray-400 uppercase tracking-wider">Total Terdaftar: {{ userList.length }} Pengguna</p>
              <span class="text-xs bg-white border border-gray-200 px-3 py-1 rounded-md font-semibold text-gray-500 shadow-sm">Validasi Staf</span>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <!-- Desktop Users Table -->
              <table class="w-full text-left border-collapse hidden md:table">
                <thead>
                  <tr class="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                    <th class="p-4">Nama Lengkap</th>
                    <th class="p-4">Username</th>
                    <th class="p-4">Peran (Role)</th>
                    <th class="p-4">Tanggal Daftar</th>
                    <th class="p-4 text-center">Status Verifikasi</th>
                    <th class="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="usr in userList" :key="usr.id" class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td class="p-4 font-bold text-sm text-gray-900">{{ usr.full_name }}</td>
                    <td class="p-4 text-sm text-gray-500 font-medium">{{ usr.username }}</td>
                    <td class="p-4 text-sm font-semibold text-gray-700">
                      <span :class="['px-2 py-0.5 rounded text-[10px] uppercase font-bold', usr.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700']">
                        {{ usr.role === 'admin' ? 'Pemilik' : 'Kasir' }}
                      </span>
                    </td>
                    <td class="p-4 text-xs text-gray-400">{{ formatDate(usr.created_at) }}</td>
                    <td class="p-4 text-center">
                      <span :class="['px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase', usr.is_verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200']">
                        {{ usr.is_verified ? 'Aktif' : 'Menunggu' }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex justify-center gap-2">
                        <button v-if="usr.id !== currentUser.id" @click="toggleUserVerification(usr)" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer', usr.is_verified ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-white bg-green-800 hover:bg-green-900 shadow-sm shadow-green-900/10']">
                          {{ usr.is_verified ? 'Tangguhkan' : 'Verifikasi' }}
                        </button>
                        <span v-else class="text-xs text-gray-400 italic font-medium p-1.5">Akun Anda</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Mobile Users List -->
              <div class="md:hidden divide-y divide-gray-100">
                <div v-for="usr in userList" :key="usr.id" class="p-4 space-y-3 hover:bg-gray-50">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-sm text-gray-900">{{ usr.full_name }}</h4>
                      <p class="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">@{{ usr.username }} &bull; {{ usr.role === 'admin' ? 'Pemilik' : 'Kasir' }}</p>
                    </div>
                    <span :class="['text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded', usr.is_verified ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50']">
                      {{ usr.is_verified ? 'Aktif' : 'Menunggu' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs text-gray-400">
                    <span>Daftar: {{ formatDate(usr.created_at) }}</span>
                    <button v-if="usr.id !== currentUser.id" @click="toggleUserVerification(usr)" :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer', usr.is_verified ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-white bg-green-800 hover:bg-green-900']">
                      {{ usr.is_verified ? 'Tangguhkan' : 'Verifikasi' }}
                    </button>
                    <span v-else class="italic font-medium">Akun Anda</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around pb-safe z-40 shadow-xl">
      <button @click="activeTab = 'dashboard'" :class="['flex flex-col items-center pt-3 pb-2 w-1/4 transition-all cursor-pointer', activeTab === 'dashboard' ? 'text-green-800 font-black border-t-2 border-green-800' : 'text-gray-400']">
        <span class="text-xl mb-0.5">📊</span>
        <span class="text-[10px] uppercase font-bold tracking-wide">Dashboard</span>
      </button>
      <button @click="activeTab = 'menu'" :class="['flex flex-col items-center pt-3 pb-2 w-1/4 transition-all cursor-pointer', activeTab === 'menu' ? 'text-green-800 font-black border-t-2 border-green-800' : 'text-gray-400']">
        <span class="text-xl mb-0.5">🍲</span>
        <span class="text-[10px] uppercase font-bold tracking-wide">Lauk</span>
      </button>
      <button @click="activeTab = 'transactions'" :class="['flex flex-col items-center pt-3 pb-2 w-1/4 transition-all cursor-pointer', activeTab === 'transactions' ? 'text-green-800 font-black border-t-2 border-green-800' : 'text-gray-400']">
        <span class="text-xl mb-0.5">🧾</span>
        <span class="text-[10px] uppercase font-bold tracking-wide">Transaksi</span>
      </button>
      <button @click="activeTab = 'users'" :class="['flex flex-col items-center pt-3 pb-2 w-1/4 transition-all cursor-pointer', activeTab === 'users' ? 'text-green-800 font-black border-t-2 border-green-800' : 'text-gray-400']">
        <span class="text-xl mb-0.5">👥</span>
        <span class="text-[10px] uppercase font-bold tracking-wide">Validasi</span>
      </button>
    </nav>

    <!-- ADD LAUK MODAL -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        <div class="p-6 overflow-y-auto">
          <div class="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-800 font-bold text-lg cursor-pointer">←</button>
            <h3 class="text-lg font-black text-gray-900">Tambah Lauk</h3>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lauk</label>
              <input type="text" v-model="addForm.name" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-700 bg-white" placeholder="Nama makanan..." required />
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Kategori</label>
              <div class="flex flex-wrap gap-1.5">
                <button type="button" @click="addForm.categoryName = 'Ayam & Ikan'" :class="['px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors', addForm.categoryName === 'Ayam & Ikan' ? 'bg-green-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200']">AYAM & IKAN</button>
                <button type="button" @click="addForm.categoryName = 'Sayuran'" :class="['px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors', addForm.categoryName === 'Sayuran' ? 'bg-green-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200']">SAYURAN</button>
                <button type="button" @click="addForm.categoryName = 'Gorengan'" :class="['px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors', addForm.categoryName === 'Gorengan' ? 'bg-green-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200']">GORENGAN</button>
                <button type="button" @click="addForm.categoryName = 'Lain-lain'" :class="['px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors', addForm.categoryName === 'Lain-lain' ? 'bg-green-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200']">LAIN-LAIN</button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Harga Lauk</label>
              <div class="relative">
                <span class="absolute left-4 top-2.5 text-sm font-bold text-gray-400">Rp</span>
                <input type="number" v-model="addForm.price" class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-700 bg-white" placeholder="Masukkan Harga.." required />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Foto Makanan (URL)</label>
              <input type="text" v-model="addForm.imageUrl" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-700 bg-white" placeholder="https://images.unsplash.com/..." />
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-100 bg-gray-50 grid grid-cols-2 gap-3">
          <button @click="showAddModal = false" class="py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer">Kembali</button>
          <button @click="saveNewMenu" class="py-2.5 text-xs font-bold text-white bg-green-800 rounded-xl hover:bg-green-900 shadow-md shadow-green-800/10 cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- EDIT LAUK MODAL -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
        <button @click="showEditModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-base cursor-pointer">✕</button>
        <h3 class="text-lg font-black text-gray-900 mb-5 border-b border-gray-100 pb-2">Edit Data Lauk</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Nama Menu</label>
            <input type="text" v-model="selectedMenu.name" class="w-full border-b border-gray-200 py-1.5 font-bold text-sm text-gray-800 focus:outline-none focus:border-green-700 bg-white" required />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Kategori</label>
            <select v-model="selectedMenu.category" class="w-full border-b border-gray-200 py-1.5 font-bold text-sm text-gray-800 focus:outline-none focus:border-green-700 bg-white">
              <option>Ayam & Ikan</option>
              <option>Sayuran</option>
              <option>Gorengan</option>
              <option>Lain-lain</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Harga Porsi (Rp)</label>
            <input type="number" v-model="selectedMenu.price" class="w-full border-b border-gray-200 py-1.5 font-bold text-sm text-gray-800 focus:outline-none focus:border-green-700 bg-white" required />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">URL Foto Lauk</label>
            <input type="text" v-model="selectedMenu.image" class="w-full border-b border-gray-200 py-1.5 font-bold text-sm text-gray-800 focus:outline-none focus:border-green-700 bg-white" />
          </div>
          <div class="pt-1">
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Status Ketersediaan</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-gray-700">
                <input type="radio" :value="true" v-model="selectedMenu.available" class="accent-green-800 w-4 h-4 cursor-pointer" />
                <span>Tersedia</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-gray-700">
                <input type="radio" :value="false" v-model="selectedMenu.available" class="accent-green-800 w-4 h-4 cursor-pointer" />
                <span>Habis</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button @click="showEditModal = false" class="py-2.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer">Batal</button>
          <button @click="saveEdit" class="py-2.5 text-xs font-bold text-white bg-green-800 rounded-xl hover:bg-green-900 shadow-md shadow-green-800/10 cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- TRANSACTION DETAIL MODAL -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center md:p-4 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
        <div class="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
          <div>
            <h3 class="font-black text-lg text-gray-900">Detail Pesanan</h3>
            <p class="text-[10px] text-gray-400 font-medium mt-0.5">{{ formatDate(selectedTransaction.transaction_time) }} pukul {{ formatTime(selectedTransaction.transaction_time) }}</p>
          </div>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-800 font-bold text-lg cursor-pointer">✕</button>
        </div>

        <!-- Dynamic details list -->
        <div class="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1">
          <div v-for="detail in selectedTransaction.transaction_details" :key="detail.id" class="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
            <div>
              <p class="font-bold text-gray-800 text-sm">{{ detail.menus ? detail.menus.name : 'Lauk Makanan' }}</p>
              <p class="text-[11px] text-gray-400">Rp {{ detail.price_at_transaction.toLocaleString('id-ID') }} x {{ detail.quantity }}</p>
            </div>
            <p class="font-bold text-gray-800">Rp {{ detail.subtotal.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-3 mb-5">
          <div class="flex justify-between text-xs text-gray-400 font-semibold mb-0.5">
            <span>Subtotal</span>
            <span>Rp {{ selectedTransaction.total_amount?.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-gray-900">
            <span>Total Transaksi</span>
            <span class="text-green-800">Rp {{ selectedTransaction.total_amount?.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <button @click="deleteTransaction" class="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold text-xs py-2.5 rounded-xl transition-colors mb-3 cursor-pointer">
          HAPUS TRANSAKSI INI
        </button>
        <p class="text-[9px] text-gray-400 text-center px-4 leading-normal">
          Menghapus transaksi akan otomatis memotong nilai rekap pendapatan dan porsi lauk terjual pada laporan harian.
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { api } from '../services/api';

const emit = defineEmits(['logout', 'go-to-cashier']);

// Current logged-in user profile
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// Core Page State
const activeTab = ref('dashboard');
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailModal = ref(false);
const isLoadingData = ref(true);

const selectedMenu = ref({});
const selectedTransaction = ref({});
const activeCategoryFilter = ref('SEMUA');

// State lists
const menuList = ref([]);
const transactions = ref([]);

// Stats structure matching API
const stats = ref({
  todayRevenue: 0,
  todayTxCount: 0,
  todayPortions: 0,
  topSelling: [],
  recentTransactions: []
});

// Add Lauk Form State
const addForm = reactive({
  name: '',
  categoryName: 'Ayam & Ikan',
  price: 0,
  imageUrl: ''
});

// Dynamic Title Helper functions
const pageTitle = computed(() => {
  if (activeTab.value === 'dashboard') return 'Ringkasan Penjualan';
  if (activeTab.value === 'menu') return 'Manajemen Lauk';
  if (activeTab.value === 'transactions') return 'Catatan Transaksi';
  return 'Validasi Akses Akun';
});

const pageSubtitle = computed(() => {
  if (activeTab.value === 'dashboard') return 'Pantau performa omzet dan lauk warteg Anda secara real-time.';
  if (activeTab.value === 'menu') return 'Kelola daftar menu, atur harga, dan perbarui ketersediaan lauk hari ini.';
  if (activeTab.value === 'transactions') return 'Daftar riwayat penjualan kasir harian.';
  return 'Setujui atau tangguhkan akses akun karyawan (kasir) untuk menggunakan sistem POS.';
});

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

// ==========================================
// Category mapper functions
// ==========================================
const mapCategoryNameToId = (name) => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes('ayam') || normalized.includes('chicken') || normalized.includes('fish') || normalized.includes('ikan')) return 1;
  if (normalized.includes('sayur') || normalized.includes('vegetable')) return 2;
  if (normalized.includes('goreng') || normalized.includes('fried')) return 3;
  return 4; // Lain-lain
};

const mapCategoryIdToName = (id) => {
  if (id === 1) return 'Ayam & Ikan';
  if (id === 2) return 'Sayuran';
  if (id === 3) return 'Gorengan';
  return 'Lain-lain';
};

// ==========================================
// Data Loaders
// ==========================================
const refreshAllData = async () => {
  isLoadingData.value = true;
  try {
    // 1. Fetch Dashboard Stats
    const statsData = await api.dashboard.getStats();
    stats.value = statsData;

    // 2. Fetch Menus
    const menusData = await api.menus.getAll();
    menuList.value = menusData.map(item => ({
      id: item.id,
      name: item.name,
      category: mapCategoryIdToName(item.category_id),
      categoryId: item.category_id,
      price: item.price,
      available: item.is_available,
      image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'
    }));

    // 3. Fetch Transactions
    const txData = await api.transactions.getAll();
    transactions.value = txData;

    // 4. Fetch Users for account validation
    try {
      const usersData = await api.users.getAll();
      userList.value = usersData;
    } catch (usersErr) {
      console.warn('Fallback: Could not load user validation list.', usersErr.message);
    }
  } catch (error) {
    console.error('Error refreshing admin dashboard data:', error);
  } finally {
    isLoadingData.value = false;
  }
};

const userList = ref([]);

const toggleUserVerification = async (usr) => {
  const newStatus = !usr.is_verified;
  const actionText = newStatus ? 'memverifikasi' : 'menangguhkan';
  if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${usr.full_name}?`)) return;

  try {
    await api.users.verify(usr.id, newStatus);
    alert(`Akun ${usr.full_name} berhasil ${newStatus ? 'diverifikasi' : 'ditangguhkan'}!`);
    await refreshAllData();
  } catch (error) {
    alert(error.message || 'Gagal mengubah status verifikasi akun');
  }
};

onMounted(() => {
  refreshAllData();
});

// ==========================================
// Menu Filters
// ==========================================
const filteredMenuList = computed(() => {
  if (activeCategoryFilter.value === 'SEMUA') return menuList.value;
  return menuList.value.filter(menu => {
    const categoryName = menu.category || '';
    return categoryName.toLowerCase().trim() === activeCategoryFilter.value.toLowerCase().trim();
  });
});

// ==========================================
// Date / Time Format Helpers
// ==========================================
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ==========================================
// Menu CRUD Event Handlers
// ==========================================
const openAddModal = () => {
  addForm.name = '';
  addForm.categoryName = 'Ayam & Ikan';
  addForm.price = 0;
  addForm.imageUrl = '';
  showAddModal.value = true;
};

const saveNewMenu = async () => {
  if (!addForm.name || addForm.price <= 0) {
    alert('Mohon isi nama dan harga lauk dengan benar!');
    return;
  }

  try {
    const payload = {
      name: addForm.name,
      category_id: mapCategoryNameToId(addForm.categoryName),
      price: addForm.price,
      is_available: true,
      image_url: addForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'
    };

    await api.menus.create(payload);
    showAddModal.value = false;
    alert('Lauk baru berhasil ditambahkan!');
    await refreshAllData();
  } catch (error) {
    alert(error.message || 'Gagal menambahkan lauk baru');
  }
};

const openEditModal = (menu) => {
  selectedMenu.value = { ...menu };
  showEditModal.value = true;
};

const saveEdit = async () => {
  if (!selectedMenu.value.name || selectedMenu.value.price <= 0) {
    alert('Mohon isi nama dan harga lauk dengan benar!');
    return;
  }

  try {
    const payload = {
      name: selectedMenu.value.name,
      category_id: mapCategoryNameToId(selectedMenu.value.category),
      price: selectedMenu.value.price,
      is_available: selectedMenu.value.available,
      image_url: selectedMenu.value.image
    };

    await api.menus.update(selectedMenu.value.id, payload);
    showEditModal.value = false;
    alert('Lauk berhasil diperbarui!');
    await refreshAllData();
  } catch (error) {
    alert(error.message || 'Gagal memperbarui menu');
  }
};

const handleDeleteMenu = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus lauk ini dari menu?')) return;
  try {
    await api.menus.delete(id);
    alert('Lauk berhasil dihapus!');
    await refreshAllData();
  } catch (error) {
    alert(error.message || 'Gagal menghapus lauk');
  }
};

// ==========================================
// Transaction Event Handlers
// ==========================================
const openDetailModal = (trx) => {
  selectedTransaction.value = trx;
  showDetailModal.value = true;
};

const deleteTransaction = async () => {
  if (!selectedTransaction.value.id) return;
  if (!confirm('Hapus transaksi ini? Penghapusan akan memotong rekap pendapatan.')) return;
  
  try {
    await api.transactions.delete(selectedTransaction.value.id);
    showDetailModal.value = false;
    alert('Transaksi berhasil dihapus.');
    await refreshAllData();
  } catch (error) {
    alert(error.message || 'Gagal menghapus transaksi');
  }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>