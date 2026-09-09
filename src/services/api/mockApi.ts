export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
export const API_URL = import.meta.env.VITE_API_BASE_URL;

export const LATENCY_MIN = 300;
export const LATENCY_MAX = 1200;


const FAILURE_RATE =
  Number(import.meta.env.VITE_FAILURE_RATE) > 0
    ? Number(import.meta.env.VITE_FAILURE_RATE)
    : 0;

export const randomLatency = () =>
  Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN + 1)) + LATENCY_MIN;

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const maybeFail = () => {
  if (FAILURE_RATE > 0 && Math.random() < FAILURE_RATE) {
    throw new Error("Simulated network failure. Please retry.");
  }
};

export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException("Aborted older request", "AbortError");
  }
};
