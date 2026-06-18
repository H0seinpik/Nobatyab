<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const TEHRAN = { lat: 35.6892, lng: 51.389 };

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const props = withDefaults(
  defineProps<{
    latitude?: number | null;
    longitude?: number | null;
    readonly?: boolean;
    height?: string;
  }>(),
  { readonly: false, height: "16rem" },
);

const emit = defineEmits<{
  "update:latitude": [value: number | undefined];
  "update:longitude": [value: number | undefined];
}>();

const mapEl = ref<HTMLElement | null>(null);
const mapReady = ref(false);

let map: L.Map | null = null;
let marker: L.Marker | null = null;
let resizeObserver: ResizeObserver | null = null;

function hasCoords(lat?: number | null, lng?: number | null) {
  return lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);
}

function setCoords(lat: number, lng: number) {
  emit("update:latitude", lat);
  emit("update:longitude", lng);
}

function createMarker(lat: number, lng: number) {
  if (!map) return;

  marker = L.marker([lat, lng], {
    draggable: !props.readonly,
    icon: defaultIcon,
  });
  marker.addTo(map);

  if (!props.readonly) {
    marker.on("dragend", () => {
      const pos = marker!.getLatLng();
      setCoords(pos.lat, pos.lng);
    });
  }
}

function placeMarker(lat: number, lng: number) {
  if (!map) return;
  if (marker) {
    marker.setLatLng([lat, lng]);
    return;
  }
  createMarker(lat, lng);
}

function refreshSize() {
  if (!map) return;
  map.invalidateSize();
}

function initMap() {
  if (!mapEl.value || map) return;

  const lat = hasCoords(props.latitude, props.longitude) ? props.latitude! : TEHRAN.lat;
  const lng = hasCoords(props.latitude, props.longitude) ? props.longitude! : TEHRAN.lng;

  map = L.map(mapEl.value, {
    scrollWheelZoom: !props.readonly,
    attributionControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  map.setView([lat, lng], hasCoords(props.latitude, props.longitude) ? 15 : 12);

  if (hasCoords(props.latitude, props.longitude)) {
    placeMarker(lat, lng);
  }

  if (!props.readonly) {
    map.on("click", (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      placeMarker(clickLat, clickLng);
      setCoords(clickLat, clickLng);
    });
  }

  mapReady.value = true;
  nextTick(() => {
    refreshSize();
    window.setTimeout(refreshSize, 150);
  });
}

onMounted(async () => {
  await nextTick();
  initMap();
  if (mapEl.value) {
    resizeObserver = new ResizeObserver(() => refreshSize());
    resizeObserver.observe(mapEl.value);
  }
});

watch(
  () => [props.latitude, props.longitude] as const,
  ([lat, lng]) => {
    if (!map || !hasCoords(lat, lng)) return;
    map.setView([lat!, lng!], 15);
    placeMarker(lat!, lng!);
  },
);

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  map?.remove();
  map = null;
  marker = null;
});

defineExpose({ refreshSize });
</script>

<template>
  <div class="map-picker">
    <p v-if="!readonly" class="map-picker__hint">
      روی نقشه کلیک کنید تا موقعیت کسب‌وکار مشخص شود.
    </p>
    <div
      ref="mapEl"
      class="map-picker__map"
      :style="{ height }"
    />
    <p
      v-if="!readonly && mapReady && hasCoords(latitude, longitude)"
      class="map-picker__status map-picker__status--small"
    >
      موقعیت انتخاب شد
    </p>
    <p
      v-else-if="readonly && !hasCoords(latitude, longitude)"
      class="map-picker__status"
    >
      موقعیت روی نقشه ثبت نشده است
    </p>
  </div>
</template>

<style scoped>
.map-picker__hint {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.map-picker__map {
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.map-picker__status {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.map-picker__status--small {
  font-size: 0.75rem;
}
</style>

<style>
.leaflet-container {
  z-index: 0;
  width: 100%;
  font-family: inherit;
}
</style>
