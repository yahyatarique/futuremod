import type { Data } from "@measured/puck";

export const EMPTY_PUCK_DATA: Data = { content: [], root: { props: {} } };

export function loadPageData(key: string): Data {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Data) : EMPTY_PUCK_DATA;
  } catch {
    return EMPTY_PUCK_DATA;
  }
}

export function savePageData(key: string, data: Data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}
