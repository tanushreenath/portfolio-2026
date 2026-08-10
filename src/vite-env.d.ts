/// <reference types="vite/client" />

/**
 * imagetools imports carry their transform in the query string. TypeScript
 * wildcard module declarations permit exactly one `*`, which is why every
 * import in the asset registry ends with `format=webp` -- it makes a single
 * trailing-wildcard pattern sufficient to type them all.
 */
declare module "*format=webp" {
  const src: string;
  export default src;
}
