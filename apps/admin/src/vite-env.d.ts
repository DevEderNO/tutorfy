/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_API_URL: string;
  }
}
declare var process: {
  env: NodeJS.ProcessEnv;
};
