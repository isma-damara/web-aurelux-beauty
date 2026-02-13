function isObjectLike(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizePreview(value) {
  if (typeof value === "string") {
    return value.length > 280 ? `${value.slice(0, 280)}...` : value;
  }

  if (Array.isArray(value)) {
    if (value.length > 20) {
      return [...value.slice(0, 20), "..."];
    }
    return value;
  }

  if (isObjectLike(value)) {
    const entries = Object.entries(value);
    if (entries.length > 20) {
      const limited = Object.fromEntries(entries.slice(0, 20));
      return { ...limited, "...": true };
    }
    return value;
  }

  return value;
}

export function buildChangeDiff(beforeValue, afterValue, options = {}) {
  const maxEntries = Number.isFinite(options.maxEntries) ? options.maxEntries : 120;
  const changes = [];

  function walk(path, before, after) {
    if (changes.length >= maxEntries) {
      return;
    }

    if (isObjectLike(before) && isObjectLike(after)) {
      const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
      for (const key of keys) {
        const nextPath = path ? `${path}.${key}` : key;
        walk(nextPath, before[key], after[key]);
        if (changes.length >= maxEntries) {
          return;
        }
      }
      return;
    }

    const same = JSON.stringify(before) === JSON.stringify(after);
    if (!same) {
      changes.push({
        path: path || "(root)",
        before: normalizePreview(before),
        after: normalizePreview(after)
      });
    }
  }

  walk("", beforeValue, afterValue);
  return changes;
}
