import { readFile } from "node:fs/promises";

export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  const hasKnownExtension = /\.[a-z0-9]+$/i.test(specifier);
  const isAppModule = typeof context.parentURL === "string" && context.parentURL.includes("/apps/");

  if (isRelative && !hasKnownExtension && isAppModule) {
    return nextResolve(`${specifier}.js`, context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && url.includes("/apps/") && url.endsWith(".js")) {
    const source = await readFile(new URL(url), "utf8");
    return {
      format: "module",
      source,
      shortCircuit: true
    };
  }

  return nextLoad(url, context);
}
