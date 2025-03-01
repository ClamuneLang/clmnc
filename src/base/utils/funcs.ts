export const capitalize = (s: string) => (s[0] ?? "").toUpperCase() + s.slice(1).toLowerCase();
export const isNull = (s: unknown): s is null | undefined => s === null || s === undefined;
