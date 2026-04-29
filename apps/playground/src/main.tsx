import React from "react";
import ReactDOM from "react-dom/client";
import { PlaygroundPage } from "./PlaygroundPage.js";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PlaygroundPage />
    </React.StrictMode>
  );
}
