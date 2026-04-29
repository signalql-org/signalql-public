import { defineConfig } from "vitepress";

export default defineConfig({
  title: "SignalQL",
  description: "Open query language for behavioral product analytics",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
        sizes: "any",
      },
    ],
  ],
  markdown: {
    config: (md) => {
      const defaultFence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token?.info.trim() === "mermaid") {
          return `<MermaidChart :chart='${JSON.stringify(token.content)}' />\n`;
        }
        return defaultFence
          ? defaultFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options);
      };
    },
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/why-signalql" },
      { text: "Spec", link: "/spec/v0.1" },
      { text: "Scope", link: "/spec/scope" },
      { text: "Examples", link: "/examples/library" },
      { text: "AI", link: "/ai/grammar-pack" },
      { text: "Reference", link: "/reference/ast-schema" },
      { text: "Integrations", link: "/integrations/cursor" },
      { text: "Launch", link: "/launch/adoption-brief" },
    ],
    sidebar: {
      "/guide/": [
        { text: "Why SignalQL", link: "/guide/why-signalql" },
        { text: "Run your first query", link: "/guide/first-query" },
        { text: "Local Postgres run", link: "/guide/postgres-local" },
        { text: "Portable data model", link: "/guide/data-model" },
      ],
      "/spec/": [
        { text: "v0.1 specification", link: "/spec/v0.1" },
        { text: "Language scope", link: "/spec/scope" },
      ],
      "/examples/": [{ text: "Canonical library", link: "/examples/library" }],
      "/ai/": [
        { text: "LLM grammar pack", link: "/ai/grammar-pack" },
        { text: "Prompting guide", link: "/ai/prompting-guide" },
      ],
      "/reference/": [
        { text: "AST JSON Schema", link: "/reference/ast-schema" },
        { text: "Parser API", link: "/reference/parser" },
        { text: "Adapters API", link: "/reference/adapters" },
      ],
      "/integrations/": [
        { text: "Cursor", link: "/integrations/cursor" },
        { text: "Claude", link: "/integrations/claude" },
        { text: "ChatGPT", link: "/integrations/chatgpt" },
        { text: "MCP server", link: "/integrations/mcp" },
      ],
      "/launch/": [{ text: "Adoption brief", link: "/launch/adoption-brief" }],
    },
  },
});
