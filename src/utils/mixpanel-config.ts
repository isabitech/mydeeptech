import mixpanel from "mixpanel-browser";

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

mixpanel.init(mixpanelToken, {
  debug: false,
  track_pageview: true,
  persistence: "localStorage",
});

const environ = (import.meta.env.MODE as "production" | "development") || "production";

export { mixpanel, environ };