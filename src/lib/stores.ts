import { writable, type Writable } from 'svelte/store';

export const searchQuery = writable('');
export const sidebarOpen = writable(false);

export type Notification = { id: string; message: string; type: 'success' | 'error' | 'info'; duration: number };
export const notifications: Writable<Notification[]> = writable([]);

let nid = 0;
export function toast(type: Notification['type'], message: string, duration = 4000) {
  const id = `n-${++nid}`;
  notifications.update(n => [...n, { id, message, type, duration }]);
  setTimeout(() => {
    notifications.update(n => n.filter(x => x.id !== id));
  }, duration);
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
