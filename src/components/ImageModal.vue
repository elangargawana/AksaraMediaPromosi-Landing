<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  imageSrc: '',
  imageAlt: '',
  title: '',
})

const emit = defineEmits<{
  close: []
}>()

const imageLoaded = ref(false)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      imageLoaded.value = false
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  },
)

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <!-- Modal Container -->
        <div
          class="relative max-w-4xl max-h-screen w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
        >
          <!-- Close Button -->
          <button
            class="absolute top-4 right-4 md:top-8 md:right-8 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 backdrop-blur-sm"
            @click="handleClose"
            aria-label="Close modal"
          >
            <X :size="24" class="text-white" />
          </button>

          <!-- Image Container -->
          <div class="relative w-full h-full flex flex-col items-center justify-center">
            <!-- Image -->
            <img
              :src="imageSrc"
              :alt="imageAlt"
              class="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
              @load="imageLoaded = true"
            />

            <!-- Loading Spinner -->
            <div v-if="!imageLoaded" class="absolute inset-0 flex items-center justify-center">
              <div
                class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"
              ></div>
            </div>

            <!-- Image Title -->
            <div v-if="imageLoaded && title" class="mt-6 text-center">
              <p class="text-white text-lg font-semibold">{{ title }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from {
  opacity: 0;
}

.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from :deep(.relative) {
  transform: scale(0.95);
}

.modal-fade-leave-to :deep(.relative) {
  transform: scale(0.95);
}
</style>
