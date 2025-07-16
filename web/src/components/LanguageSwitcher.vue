<template>
  <div class="language-switcher">
    <Button 
      icon="pi pi-globe"
      :label="$t('languageSwitcher.label')"
      text
      @click="toggleLanguage"
      v-tooltip="$t('languageSwitcher.tooltip')"
    />
    <span class="current-locale">{{ currentLocale.toUpperCase() }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

function toggleLanguage() {
  // For now, just a placeholder - could cycle through available languages
  console.log('Language switcher clicked - current locale:', locale.value)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-locale {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}
</style>