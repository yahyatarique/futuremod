/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FUTUREMOD_ROOT_DOMAIN?: string;
  readonly VITE_FUTUREMOD_PROJECT_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
