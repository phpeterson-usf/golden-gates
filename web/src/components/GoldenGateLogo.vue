<template>
  <svg
    :width="width || size * 2"
    :height="height || size"
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="golden-gate-logo"
  >
    <!-- Main suspension cables with characteristic arch -->
    <path
      d="M2 14 C2 8, 12 4, 12 4 C12 4, 24 12, 24 12 C24 12, 36 4, 36 4 C36 4, 46 8, 46 14"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      fill="none"
      class="logo-cables"
    />
    
    <!-- Bridge deck (straight) -->
    <line
      x1="1"
      y1="14"
      x2="47"
      y2="14"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      class="logo-deck"
    />
    
    <!-- Left tower -->
    <rect
      x="10"
      y="6"
      width="3"
      height="12"
      :fill="fillColor"
      class="logo-tower-left"
    />
    
    <!-- Right tower -->
    <rect
      x="35"
      y="6"
      width="3"
      height="12"
      :fill="fillColor"
      class="logo-tower-right"
    />
    
    <!-- Tower details - cross beams -->
    <g class="logo-tower-details">
      <!-- Left tower cross beams -->
      <line x1="10" y1="9" x2="13" y2="9" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="10" y1="12" x2="13" y2="12" :stroke="strokeColor" :stroke-width="0.5" />
      
      <!-- Right tower cross beams -->
      <line x1="35" y1="9" x2="38" y2="9" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="35" y1="12" x2="38" y2="12" :stroke="strokeColor" :stroke-width="0.5" />
    </g>
    
    <!-- Vertical suspension cables -->
    <g class="logo-vertical-cables">
      <!-- Left section -->
      <line x1="4" y1="11" x2="4" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="6" y1="9.5" x2="6" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="8" y1="8" x2="8" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      
      <!-- Center section (cables hang from curved main cable) -->
      <line x1="16" y1="8" x2="16" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="19" y1="9.5" x2="19" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="22" y1="11" x2="22" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="24" y1="12" x2="24" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="26" y1="11" x2="26" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="29" y1="9.5" x2="29" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="32" y1="8" x2="32" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      
      <!-- Right section -->
      <line x1="40" y1="8" x2="40" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="42" y1="9.5" x2="42" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
      <line x1="44" y1="11" x2="44" y2="14" :stroke="strokeColor" :stroke-width="0.5" />
    </g>
    
    <!-- Water/base -->
    <path
      d="M1 18 Q4 17 7 18 T13 18 Q16 17 19 18 T25 18 Q28 17 31 18 T37 18 Q40 17 43 18 T47 18"
      :stroke="strokeColor"
      :stroke-width="0.5"
      fill="none"
      class="logo-water"
    />
  </svg>
</template>

<script>
export default {
  name: 'GoldenGateLogo',
  props: {
    size: {
      type: [Number, String],
      default: 24
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    strokeColor: {
      type: String,
      default: 'currentColor'
    },
    fillColor: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: [Number, String],
      default: 1.5
    }
  }
}
</script>

<style>
.golden-gate-logo {
  display: inline-block;
  vertical-align: middle;
}

/* Animation on hover */
.golden-gate-logo:hover .logo-cables {
  animation: sway 2s ease-in-out infinite;
}

.golden-gate-logo:hover .logo-water {
  animation: wave 3s ease-in-out infinite;
}

@keyframes sway {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(0.5px);
  }
}

@keyframes wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(1px);
  }
}

/* Style variations */
.golden-gate-logo.logo-outlined .logo-tower-left,
.golden-gate-logo.logo-outlined .logo-tower-right {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
}

/* Responsive adjustments */
.golden-gate-logo.logo-small .logo-vertical-cables {
  display: none;
}

.golden-gate-logo.logo-small .logo-water {
  display: none;
}
</style>