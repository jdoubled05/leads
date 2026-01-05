export const trackAdsConversion = (sendTo: string) => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "conversion", { send_to: sendTo });
};
