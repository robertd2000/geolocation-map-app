<template>
  <div class="h-screen relative">
    <geo-error-modal
      v-if="geoErr"
      :geoErrMessage="geoErrMessage"
      @closeGeoError="closeGeoError"
    />
    <map-features
      :fetchCoords="fetchCoords"
      :coords="coords"
      @getGeoLocation="getGeoLocation"
      @plotResult="plotResult"
      @toggleSearchResults="toggleSearchResults"
      @removeResult="removeResult"
      :searchResults="searchResults"
    />
    <div id="map" class="h-full z-[1]"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import leaflet from 'leaflet'
import { onMounted, ref } from 'vue'
import GeoErrorModal from '../components/GeoErrorModal.vue'
import MapFeatures from '../components/MapFeatures.vue'

export default {
  name: 'Home',
  components: { GeoErrorModal, MapFeatures },
  setup() {
    let map
    onMounted(() => {
      map = leaflet.map('map').setView([51.505, -0.09], 10)

      leaflet
        .tileLayer(
          `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{retina}?access_token=${process.env.VUE_APP_API_KEY}`,
          {
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: process.env.VUE_APP_API_KEY,
            retina: '@2x',
          }
        )
        .addTo(map)

      map.on('moveend', () => {
        closeSearchResults()
      })

      getGeoLocation()
    })

    const coords = ref(null)
    const fetchCoords = ref(null)
    const geoMarker = ref(null)
    const geoErr = ref(null)
    const geoErrMessage = ref(null)

    const getGeoLocation = () => {
      if (coords.value) {
        coords.value = null
        sessionStorage.removeItem('coords')
        map.removeLayer(geoMarker.value)
        return
      }
      if (sessionStorage.getItem('coords')) {
        coords.value = JSON.parse(sessionStorage.getItem('coords'))
        plotGeolocation(coords.value)
        return
      }

      fetchCoords.value = true
      navigator.geolocation.getCurrentPosition(setCoords, getLocError)
    }

    const setCoords = (pos) => {
      fetchCoords.value = null

      const setSessionCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }

      sessionStorage.setItem('coords', JSON.stringify(setSessionCoords))

      coords.value = setSessionCoords

      plotGeolocation(coords.value)
    }

    const getLocError = (err) => {
      fetchCoords.value = null
      geoErr.value = true
      geoErrMessage.value = err.message
    }

    const plotGeolocation = (coords) => {
      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map-marker-red.svg'),
        iconSize: [35, 35],
      })

      geoMarker.value = leaflet
        .marker([coords.lat, coords.lng], {
          icon: customMarker,
        })
        .addTo(map)

      map.setView([coords.lat, coords.lng], 10)
    }

    const closeGeoError = () => {
      geoErr.value = null
      geoErrMessage.value = null
    }

    const resultMarker = ref(null)
    const plotResult = (coords) => {
      if (resultMarker.value) {
        map.removeLayer(resultMarker.value)
      }
      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map-marker-blue.svg'),
        iconSize: [35, 35], // size of the icon
      })
      resultMarker.value = leaflet
        .marker([coords.coordinates[1], coords.coordinates[0]], {
          icon: customMarker,
        })
        .addTo(map)
      map.setView([coords.coordinates[1], coords.coordinates[0]], 13)
      closeSearchResults()
    }

    const searchResults = ref(null)
    const toggleSearchResults = () => {
      searchResults.value = !searchResults.value
    }

    const closeSearchResults = () => {
      searchResults.value = null
    }

    const removeResult = () => {
      map.removeLayer(resultMarker.value)
    }
    return {
      coords,
      geoMarker,
      closeGeoError,
      geoErr,
      geoErrMessage,
      fetchCoords,
      getGeoLocation,
      plotResult,
      searchResults,
      toggleSearchResults,
      closeSearchResults,
      removeResult,
    }
  },
}
</script>

<style>
img {
  image-rendering: auto;
  image-rendering: crisp-edges;
  image-rendering: pixelated;

  /* Safari seems to support, but seems deprecated and does the same thing as the others. */
  image-rendering: -webkit-optimize-contrast;
}
</style>
