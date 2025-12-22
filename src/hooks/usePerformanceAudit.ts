"use client";

const PERFORMANCE_AUDIT_PARAM = "audit";
const PERFORMANCE_AUDIT_VALUES = new Set(["1", "true", "yes"]);
const DEFAULT_AUDIT_STATE = false;

export function usePerformanceAudit() {
  if (typeof window === "undefined") return DEFAULT_AUDIT_STATE;
  const params = new URLSearchParams(window.location.search);
  const rawValue = params.get(PERFORMANCE_AUDIT_PARAM);
  if (!rawValue) return DEFAULT_AUDIT_STATE;
  return PERFORMANCE_AUDIT_VALUES.has(rawValue.toLowerCase());
}

export default usePerformanceAudit;
