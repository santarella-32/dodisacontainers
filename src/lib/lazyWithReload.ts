import { lazy, type ComponentType } from "react";

// Every deploy replaces dist/assets with freshly content-hashed chunk files.
// A tab left open across a deploy still holds the OLD chunk URLs, so the next
// lazy import 404s with "Failed to fetch dynamically imported module". Since
// the new build's index.html has the correct hashes, a single reload fixes
// it — this wraps lazy() so recovery happens automatically instead of
// leaving the visitor stuck on a broken screen. The sessionStorage guard
// stops a reload loop if the failure isn't actually chunk-staleness.
export function lazyWithReload<T extends { default: ComponentType<any> }>(factory: () => Promise<T>) {
  return lazy(() =>
    factory().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const isChunkError = /fetch dynamically imported module|error loading dynamically imported module|Loading chunk/i.test(message);
      const reloadedKey = "dodisa_chunk_reload_once";
      if (isChunkError && !sessionStorage.getItem(reloadedKey)) {
        sessionStorage.setItem(reloadedKey, "1");
        window.location.reload();
        return new Promise<T>(() => {}); // reload is already in flight; never resolve
      }
      throw err;
    })
  );
}
