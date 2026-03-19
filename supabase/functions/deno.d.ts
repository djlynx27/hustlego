// Type declarations for the Deno runtime — used by Supabase Edge Functions.
// This file suppresses VS Code TypeScript false positives when the Deno VS Code
// extension is not installed. Deno itself compiles these files correctly at runtime.

declare const Deno: {
  readonly env: {
    get(key: string): string | undefined;
  };
};

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}
