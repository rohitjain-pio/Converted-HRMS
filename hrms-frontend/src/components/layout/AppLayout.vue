<template>
  <v-app>
    <app-header @toggle-drawer="drawer = !drawer" />
    <app-sidebar v-model="drawer" />
    
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';

const drawer = ref(true);
</script>
