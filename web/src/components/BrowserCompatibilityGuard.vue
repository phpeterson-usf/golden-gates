<template>
  <div>
    <!-- Compatibility check overlay -->
    <div v-if="isCompatible === false" class="browser-compatibility-overlay">
      <div class="compatibility-container">
        <div class="compatibility-content">
          <!-- Icon -->
          <div class="warning-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>

          <!-- Title -->
          <h1 class="compatibility-title">{{ $t('browserCompat.title') }}</h1>

          <!-- Main message -->
          <p class="compatibility-message">{{ $t('browserCompat.message') }}</p>

          <!-- Missing features -->
          <div v-if="incompatibleFeatures.length > 0" class="missing-features">
            <h3>{{ $t('browserCompat.missingFeatures') }}</h3>
            <ul>
              <li v-for="feature in incompatibleFeatures" :key="feature">
                <i class="pi pi-times-circle"></i>
                {{ $t(`browserCompat.features.${feature}`) }}
              </li>
            </ul>
          </div>

          <!-- Browser recommendations -->
          <div class="browser-recommendations">
            <h3>{{ $t('browserCompat.recommendedBrowsers') }}</h3>
            <div class="browser-grid">
              <a
                v-for="browser in browserRecommendations"
                :key="browser.name"
                :href="browser.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="browser-option"
              >
                <div class="browser-icon">
                  <i :class="browser.icon"></i>
                </div>
                <div class="browser-info">
                  <div class="browser-name">{{ browser.name }}</div>
                  <div class="browser-version">{{ browser.minVersion }}+</div>
                </div>
              </a>
            </div>
          </div>

          <!-- Additional help -->
          <p class="help-text">{{ $t('browserCompat.helpText') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading state while checking -->
    <div v-else-if="isCompatible === null" class="compatibility-checking">
      <i class="pi pi-spin pi-spinner"></i>
      <span>{{ $t('browserCompat.checking') }}</span>
    </div>

    <!-- Normal app content when compatible -->
    <slot v-else />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useBrowserCompatibility } from '../composables/useBrowserCompatibility'

export default {
  name: 'BrowserCompatibilityGuard',
  setup() {
    const {
      isCompatible,
      incompatibleFeatures,
      browserRecommendations,
      checkBrowserCompatibility
    } = useBrowserCompatibility()

    onMounted(() => {
      // Run compatibility check on mount
      checkBrowserCompatibility()
    })

    return {
      isCompatible,
      incompatibleFeatures,
      browserRecommendations
    }
  }
}
</script>

<style scoped>
.browser-compatibility-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-app-bg) 0%, var(--color-panel-bg) 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.compatibility-container {
  max-width: 600px;
  width: 100%;
  background: var(--color-panel-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-large);
  padding: 40px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.compatibility-content {
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  color: var(--color-warning);
  margin-bottom: 20px;
}

.compatibility-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.compatibility-message {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.missing-features {
  background: var(--color-component-warning-fill);
  border: 1px solid var(--color-warning);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.missing-features h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-component-warning-stroke);
  margin-bottom: 12px;
}

.missing-features ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.missing-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-component-warning-stroke);
  margin-bottom: 8px;
  font-size: 14px;
}

.missing-features li:last-child {
  margin-bottom: 0;
}

.missing-features .pi-times-circle {
  font-size: 14px;
  flex-shrink: 0;
}

.browser-recommendations h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.browser-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.browser-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: var(--color-component-fill);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.browser-option:hover {
  background: var(--color-component-hover-fill);
  border-color: var(--color-border-medium);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.browser-icon {
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--color-text-secondary);
}

.browser-info {
  text-align: center;
}

.browser-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.browser-version {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.help-text {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 24px;
}

.compatibility-checking {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--color-overlay-bg);
  z-index: 9999;
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* Responsive design */
@media (max-width: 640px) {
  .compatibility-container {
    padding: 24px;
  }

  .compatibility-title {
    font-size: 24px;
  }

  .browser-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
