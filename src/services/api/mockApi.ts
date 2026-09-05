export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
export const API_URL = import.meta.env.VITE_API_BASE_URL;

// Simulated latency range (ms). Tests/QA can rely on 300-1200ms per spec.
export const LATENCY_MIN = 300;
export const LATENCY_MAX = 1200;

// Probability of a simulated failure. 0 by default for reliable demos;
// set VITE_FAILURE_RATE=0.1 in .env to exercise error/retry states.
const FAILURE_RATE =
  Number(import.meta.env.VITE_FAILURE_RATE) > 0
    ? Number(import.meta.env.VITE_FAILURE_RATE)
    : 0;

export const randomLatency = () =>
  Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN + 1)) + LATENCY_MIN;

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Throws when the simulated failure rate is triggered in mock mode. */
export const maybeFail = () => {
  if (FAILURE_RATE > 0 && Math.random() < FAILURE_RATE) {
    throw new Error("Simulated network failure. Please retry.");
  }
};

/** Throws an AbortError when a request signal was cancelled. */
export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException("Aborted older request", "AbortError");
  }
};
