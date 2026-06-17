import { useSettingsStore } from "@/store";

/** Trigger device vibration if haptics are enabled and the API is available. */
export function haptic(pattern: number | number[] = 20) {
  if (!useSettingsStore.getState().hapticsOn) return;
  navigator.vibrate?.(pattern);
}
