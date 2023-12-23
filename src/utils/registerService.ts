export const registerService = <T extends any, N extends string>(
  name: N,
  initFn: () => T,
): T => {
  const globalForService = globalThis as Record<N, T>;
  if (process.env.NODE_ENV === "development") {
    if (!(name in global)) {
      globalForService[name] = initFn();
    }
    return globalForService[name];
  }
  return initFn();
};
