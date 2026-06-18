/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_URL?: string;
  readonly VITE_BASIC_PACKAGE_AMOUNT_KOBO?: string;
  readonly VITE_PRO_PACKAGE_AMOUNT_KOBO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
