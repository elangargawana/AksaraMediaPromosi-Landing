<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, X, Monitor } from 'lucide-vue-next'
import BillboardMap from '@/components/BillboardMap.vue'
import BillboardSidebar from '@/components/BillboardSidebar.vue'
import { useVideotronStore } from '@/stores/videotrons'

const videotronStore = useVideotronStore()

const selectedId = ref<number | null>(null)
const searchQuery = ref('')
const selectedCity = ref('')

const filteredVideotrons = computed(() => {
  return videotronStore.videotrons.filter((v) => {
    const matchSearch =
      !searchQuery.value ||
      v.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      v.district.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCity = !selectedCity.value || v.city === selectedCity.value
    return matchSearch && matchCity
  })
})

const activeFiltersCount = computed(() => {
  return [selectedCity.value, searchQuery.value].filter(Boolean).length
})

const clearFilters = () => {
  searchQuery.value = ''
  selectedCity.value = ''
}

const stats = computed(() => ({
  total: filteredVideotrons.value.length,
  available: filteredVideotrons.value.filter((v) => v.status === 'Available').length,
  booked: filteredVideotrons.value.filter((v) => v.status === 'Booked').length,
}))

const videotronCities = computed(() => videotronStore.cities)

onMounted(async () => {
  await videotronStore.fetchVideotrons()

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
    { threshold: 0.1 },
  )
  document.querySelectorAll('.fade-in-up').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <section class="gradient-bg pt-28 pb-12 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1551516594-56cb78394645?w=1400&q=80"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover opacity-[0.1] mix-blend-luminosity pointer-events-none select-none"
      />
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 28px 28px;
        "
      ></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl"></div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center text-white mb-8 fade-in-up visible">
          <div
            class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-4"
          >
            <Monitor :size="14" class="text-blue-300" />
            Jaringan Videotron Digital Terluas
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Peta Lokasi
            <span class="gradient-text-white"> Videotron</span>
          </h1>
          <p class="text-blue-100 text-lg max-w-2xl mx-auto">
            Temukan titik strategis videotron digital kami di seluruh Jawa Tengah & DIY. Klik
            marker untuk melihat detail lokasi.
          </p>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto fade-in-up visible">
          <div class="text-center bg-white/10 border border-white/20 rounded-2xl p-4">
            <div class="text-2xl font-extrabold text-white">{{ stats.total }}</div>
            <div class="text-blue-100 text-xs font-semibold mt-0.5">Total Titik</div>
          </div>
          <div class="text-center bg-white/10 border border-white/20 rounded-2xl p-4">
            <div class="text-2xl font-extrabold text-green-400">{{ stats.available }}</div>
            <div class="text-blue-100 text-xs font-semibold mt-0.5">Tersedia</div>
          </div>
          <div class="text-center bg-white/10 border border-white/20 rounded-2xl p-4">
            <div class="text-2xl font-extrabold text-amber-400">{{ stats.booked }}</div>
            <div class="text-blue-100 text-xs font-semibold mt-0.5">Terpesan</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Bar -->
    <div class="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <!-- Search -->
          <div class="relative flex-1 max-w-sm">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari lokasi, kota, atau area..."
              class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="searchQuery = ''"
            >
              <X :size="14" />
            </button>
          </div>

          <!-- Filters -->
          <div class="flex gap-2 flex-wrap">
            <select
              v-model="selectedCity"
              class="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium text-gray-700"
            >
              <option value="">Semua Kota</option>
              <option v-for="city in videotronCities" :key="city" :value="city">{{ city }}</option>
            </select>

            <button
              v-if="activeFiltersCount > 0"
              class="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2.5 rounded-xl hover:bg-red-50 border border-red-200 transition-colors"
              @click="clearFilters"
            >
              <X :size="14" />
              Reset ({{ activeFiltersCount }})
            </button>
          </div>

          <div class="text-sm text-gray-500 shrink-0 font-medium">
            <span class="text-blue-600 font-bold">{{ filteredVideotrons.length }}</span> lokasi
            ditemukan
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Map + Sidebar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading state -->
      <div v-if="videotronStore.loading" class="flex items-center justify-center h-80 text-gray-400">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm font-medium">Memuat data videotron...</p>
        </div>
      </div>
      <!-- Error state -->
      <div v-else-if="videotronStore.error" class="flex items-center justify-center h-80 text-red-500">
        {{ videotronStore.error }}
      </div>
      <div v-else class="flex flex-col md:flex-row md:gap-6 md:h-[calc(100vh-220px)] md:min-h-150">
        <!-- Map -->
        <div
          class="w-full h-80 md:h-auto md:flex-1 rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-4 md:mb-0 order-1 md:order-2"
        >
          <BillboardMap
            :billboards="filteredVideotrons"
            :selected-id="selectedId"
            @select="selectedId = $event"
          />
        </div>

        <!-- Sidebar -->
        <div class="md:w-80 lg:w-96 shrink-0 overflow-y-auto max-h-[70vh] md:max-h-none order-2 md:order-1">
          <BillboardSidebar
            :billboards="filteredVideotrons"
            :selected-id="selectedId"
            @select="selectedId = $event"
            @deselect="selectedId = null"
          />
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="gradient-bg rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551516594-56cb78394645?w=1200&q=80"
            alt=""
            aria-hidden="true"
            class="absolute inset-0 w-full h-full object-cover opacity-[0.08] mix-blend-luminosity pointer-events-none select-none"
          />
          <div
            class="absolute inset-0 pointer-events-none"
            style="
              background-image: radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
              background-size: 28px 28px;
            "
          ></div>
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-2xl"></div>
            <div class="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-400/10 blur-2xl"></div>
          </div>
          <div class="relative">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3">
              Tidak Menemukan Lokasi Videotron yang Tepat?
            </h2>
            <p class="text-blue-100 mb-6 max-w-xl mx-auto">
              Tim kami siap membantu Anda menemukan lokasi strategis terbaik sesuai target audiens
              dan anggaran bisnis Anda.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/6281220005102?text=Halo%2C%20saya%20ingin%20konsultasi%20lokasi%20videotron"
                target="_blank"
                class="btn-white"
              >
                Konsultasi Lokasi
              </a>
              <RouterLink to="/contact" class="btn-outline-white"> Hubungi Kami </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
