/**
 * Rough byte-size estimator for JS objects/values.
 * Uses UTF-8 encoding for strings.
 * Handles circular references.
 */

export function byteSize(value: unknown): number {
  const seen = new WeakSet<object>();
  const encoder = new TextEncoder();

  function sizeOf(val: unknown): number {
    if (val === null || val === undefined) return 0;

    switch (typeof val) {
      case "boolean":
        return 4;

      case "number":
        return 8;

      case "bigint":
        return 8;

      case "string":
        return encoder.encode(val).length;

      case "symbol":
        return encoder.encode(String(val)).length;

      case "function":
        return 0;

      case "object": {
        if (seen.has(val as object)) return 0;
        seen.add(val as object);

        // ArrayBuffer
        if (val instanceof ArrayBuffer) {
          return val.byteLength;
        }

        // Typed arrays
        if (ArrayBuffer.isView(val)) {
          return val.byteLength;
        }

        // Date
        if (val instanceof Date) {
          return 8;
        }

        // Map
        if (val instanceof Map) {
          let bytes = 0;
          for (const [k, v] of val) {
            bytes += sizeOf(k);
            bytes += sizeOf(v);
          }
          return bytes;
        }

        // Set
        if (val instanceof Set) {
          let bytes = 0;
          for (const item of val) {
            bytes += sizeOf(item);
          }
          return bytes;
        }

        // Plain object / array
        let bytes = 0;

        for (const [key, value] of Object.entries(val)) {
          bytes += encoder.encode(key).length;
          bytes += sizeOf(value);
        }

        return bytes;
      }

      default:
        return 0;
    }
  }

  return sizeOf(value);
}
