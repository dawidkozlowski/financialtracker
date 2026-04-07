export function initAnalytics() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) return;
  // Placeholder pod realną inicjalizację posthog-js.
  console.info("PostHog init configured");
}
