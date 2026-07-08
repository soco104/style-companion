export const formatCents = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    currency,
    style: "currency"
  }).format(cents / 100);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
