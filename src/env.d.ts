/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_R2_BUCKET_URL: string
  // ... any other env vars ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 