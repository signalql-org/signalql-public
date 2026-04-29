import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import MermaidChart from "./components/MermaidChart.vue";

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp?.({ app });
    app.component("MermaidChart", MermaidChart);
  },
};

export default theme;
