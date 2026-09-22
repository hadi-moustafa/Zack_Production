// Lets the Pricing section tell the Contact section which package the
// visitor picked, without needing a shared server-side state/context.
export const PLAN_SELECTED_EVENT = "zp:plan-selected";

export function selectPlan(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PLAN_SELECTED_EVENT, { detail: name }));
}
