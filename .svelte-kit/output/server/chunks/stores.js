import { w as writable } from "./index.js";
const notifications = writable([]);
let nid = 0;
function toast(type, message, duration = 4e3) {
  const id = `n-${++nid}`;
  notifications.update((n) => [...n, { id, message, type, duration }]);
  setTimeout(() => {
    notifications.update((n) => n.filter((x) => x.id !== id));
  }, duration);
}
export {
  notifications as n,
  toast as t
};
