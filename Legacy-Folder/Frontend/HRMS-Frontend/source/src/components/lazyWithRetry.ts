import { ComponentType, lazy } from "react";

function retryImportOrReload<T>(
  importFn: () => Promise<{ default: T }>,
  retriesLeft = 3,
  interval = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((err) => {
        if (retriesLeft <= 1) {
          window.location.reload();
          return;
        }

        return setTimeout(() => {
          retryImportOrReload(importFn, retriesLeft - 1, interval);
        }, interval);

        reject(err);
      });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) {
  return lazy(() => retryImportOrReload(importFn));
}
