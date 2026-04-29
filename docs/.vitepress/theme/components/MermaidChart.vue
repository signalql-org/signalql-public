<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  chart: string;
}>();

const root = ref<HTMLElement | null>(null);
let observer: MutationObserver | null = null;
let renderCount = 0;

const isDark = computed(() =>
  document.documentElement.classList.contains("dark")
);

const renderChart = async () => {
  if (!root.value) return;
  const mermaidModule = await import("mermaid");
  const mermaid = mermaidModule.default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: isDark.value ? "dark" : "default",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  });
  renderCount += 1;
  const id = `signalql-mermaid-${renderCount}`;
  const { svg } = await mermaid.render(id, props.chart);
  root.value.innerHTML = svg;
};

onMounted(async () => {
  await renderChart();
  observer = new MutationObserver(async () => {
    await renderChart();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="root" class="mermaid-chart" />
</template>

<style scoped>
.mermaid-chart {
  margin: 16px 0;
  overflow-x: auto;
}

.mermaid-chart :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
