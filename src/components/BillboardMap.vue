<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import ImageModal from './ImageModal.vue'
import type { Billboard } from '@/data/billboards'

const props = defineProps<{
  billboards: Billboard[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  select: [id: number]
}>()

const mapRef = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markers: Map<number, L.Marker> = new Map()

// Modal state
const isImageModalOpen = ref(false)
const selectedImageUrl = ref<string | null>(null)
const selectedImageTitle = ref<string>('')

const statusColor: Record<string, string> = {
  Available: '#22c55e',
  Booked: '#f59e0b',
  Maintenance: '#ef4444',
}

const createIcon = (status: string, isActive: boolean) => {
  const color = isActive ? '#f59e0b' : '#2563EB'
  const size = isActive ? 42 : 36
  return L.divIcon({
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,${color},${isActive ? '#d97706' : '#1e3a8a'});
        border:3px solid white;
        box-shadow:0 4px 12px ${color}60;
        transform:rotate(-45deg);
        transition:all 0.3s ease;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="transform:rotate(45deg);width:8px;height:8px;border-radius:50%;background:${statusColor[status] || 'white'};"></div>
      </div>
    `,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

const iconMapPin = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
const iconPhone = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.12 6.12l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`

const createPopupHtml = (b: Billboard) => {
  const imageUrl = b.image ?? null
  const imageHtml = imageUrl ? `
    <div style="margin-bottom:12px;border-radius:8px;overflow:hidden;cursor:pointer;" data-image-url="${imageUrl}" data-image-title="${b.name}">
      <img src="${imageUrl}" alt="${b.name}" style="width:100%;height:180px;object-fit:cover;display:block;transition:opacity 0.3s ease;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" />
    </div>
  ` : ''
  
  return `
  <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:260px;">
    <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:16px;color:white;">
      <div style="font-size:11px;font-weight:600;opacity:0.7;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${b.type}</div>
      <div style="font-size:15px;font-weight:700;line-height:1.3;">${b.name}</div>
      <div style="font-size:12px;opacity:0.8;margin-top:4px;display:flex;align-items:center;">${iconMapPin} ${b.district}, ${b.city}</div>
    </div>
    <div style="padding:14px;">
      ${imageHtml}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
        <div style="background:#f8fafc;padding:10px;border-radius:10px;">
          <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:2px;">Ukuran</div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;">${b.size}</div>
        </div>
        <div style="background:#f8fafc;padding:10px;border-radius:10px;">
          <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:2px;">Status</div>
          <div style="font-size:13px;font-weight:700;color:${statusColor[b.status] || '#2563eb'};">${b.status}</div>
        </div>
      </div>
      <a href="/contact" style="
        display:flex;
        align-items:center;
        justify-content:center;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        color:white;
        padding:10px 16px;
        border-radius:10px;
        font-size:13px;
        font-weight:700;
        text-decoration:none;
        box-shadow:0 4px 12px #2563eb40;
      ">${iconPhone} Tanya Ketersediaan</a>
    </div>
  </div>
`
}

const initMap = () => {
  if (!mapRef.value) return
  map = L.map(mapRef.value, {
    center: [-7.5, 110.4],
    zoom: 8,
    zoomControl: false,
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // Tile layer - OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  props.billboards.forEach((b) => {
    const marker = L.marker([b.lat, b.lng], {
      icon: createIcon(b.status, false),
    })

    marker.on('click', () => {
      emit('select', b.id)
    })

    const popup = L.popup({ closeButton: false, maxWidth: 300 }).setContent(createPopupHtml(b))
    
    // Add event listener for popup open to attach image click handlers
    marker.on('popupopen', () => {
      setTimeout(() => {
        const popupContent = document.querySelector('.leaflet-popup-content')
        if (popupContent) {
          const imageDiv = popupContent.querySelector('[data-image-url]')
          if (imageDiv) {
            imageDiv.addEventListener('click', () => {
              selectedImageUrl.value = imageDiv.getAttribute('data-image-url')
              selectedImageTitle.value = imageDiv.getAttribute('data-image-title') || ''
              isImageModalOpen.value = true
            })
          }
        }
      }, 0)
    })
    
    marker.bindPopup(popup)
    marker.addTo(map!)
    markers.set(b.id, marker)
  })
}

watch(
  () => props.selectedId,
  (newId, oldId) => {
    if (oldId) {
      const oldMarker = markers.get(oldId)
      const oldB = props.billboards.find((b) => b.id === oldId)
      if (oldMarker && oldB) oldMarker.setIcon(createIcon(oldB.status, false))
    }
    if (newId) {
      const marker = markers.get(newId)
      const b = props.billboards.find((b) => b.id === newId)
      if (marker && b) {
        marker.setIcon(createIcon(b.status, true))
        marker.openPopup()
        map?.flyTo([b.lat, b.lng], 12, { duration: 1.2 })
      }
    }
  },
)

onMounted(() => initMap())
onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div class="w-full h-full">
    <div ref="mapRef" class="w-full h-full rounded-2xl overflow-hidden z-0"></div>
    
    <!-- Image Modal -->
    <ImageModal
      :is-open="isImageModalOpen"
      :image-src="selectedImageUrl || ''"
      :image-alt="selectedImageTitle"
      :title="selectedImageTitle"
      @close="isImageModalOpen = false"
    />
  </div>
</template>
