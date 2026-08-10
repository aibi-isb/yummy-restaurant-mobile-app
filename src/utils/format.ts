export function formatLeones(value: number) {
  return `Le ${Math.round(value).toLocaleString()}`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
