import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'
import type { Billboard } from '@/data/billboards'

interface ApiVideotron {
  id: number
  name: string
  type: string
  city: string
  district: string
  address: string
  size: string
  latitude: number | null
  longitude: number | null
  status: string
  image: string | null
  image_url: string | null
  description: string | null
  is_active: boolean
}

function mapVideotron(b: ApiVideotron): Billboard {
  return {
    id: b.id,
    name: b.name,
    city: b.city,
    district: b.district,
    lat: b.latitude ?? 0,
    lng: b.longitude ?? 0,
    size: b.size,
    type: b.type as Billboard['type'],
    status: b.status as Billboard['status'],
    image: b.image_url ?? undefined,
    description: b.description ?? '',
  }
}

export const useVideotronStore = defineStore('videotrons', () => {
  const videotrons = ref<Billboard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cities = computed(() => [...new Set(videotrons.value.map((v) => v.city))])

  async function fetchVideotrons(params?: { city?: string; status?: string }) {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, string> = { type: 'Videotron' }
      if (params?.city) query.city = params.city
      if (params?.status) query.status = params.status
      const res = await apiClient.get<{ data: ApiVideotron[] }>('/billboards', query)
      videotrons.value = res.data.map(mapVideotron)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Gagal memuat data videotron'
    } finally {
      loading.value = false
    }
  }

  return { videotrons, cities, loading, error, fetchVideotrons }
})
