export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (isoDate: string, n: number) => new Date(Date.parse(isoDate) + n * 86_400_000).toISOString().slice(0, 10);
export const fmt = (isoDate: string | null) => (isoDate ? new Date(isoDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "UTC" }) : "No date");
