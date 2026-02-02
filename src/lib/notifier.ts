export type NotifyOptions = {
  variant?: "success" | "error" | "warning" | "info" | "default";
  autoHideDuration?: number;
};

let _notify: ((msg: string, options?: NotifyOptions) => void) | null = null;

export const setNotifier = (fn: (msg: string, options?: NotifyOptions) => void) => {
  _notify = fn;
};

export const notifier = (msg: string, options?: NotifyOptions) => {
  _notify?.(msg, options);
};
