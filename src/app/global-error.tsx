"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "1rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#666" }}>Please refresh the page or try again shortly.</p>
          <button
            onClick={() => reset()}
            style={{ padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
