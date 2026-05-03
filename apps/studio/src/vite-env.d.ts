/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FUTUREMOD_ROOT_DOMAIN?: string;
  readonly VITE_FUTUREMOD_PROJECT_SLUG?: string;
  /** tldraw production license (see https://tldraw.dev/sdk-features/license-key) */
  readonly VITE_TLDRAW_LICENSE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
