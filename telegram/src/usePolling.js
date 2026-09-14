import { useEffect, useRef } from 'react';

/**
 * Runs an async function on an interval, politely.
 *
 * Plain setInterval has three problems this fixes:
 *
 *  1. A backgrounded tab keeps polling forever. Nobody is looking at it, so
 *     the requests are pure waste — on a serverless backend they cost money.
 *     Polling pauses while the tab is hidden and runs once on return, so the
 *     view is fresh the moment it is looked at again.
 *  2. Requests can overlap. If one round takes longer than the interval, the
 *     next fires anyway and responses can land out of order, letting stale
 *     data overwrite fresh. A run is skipped while one is still in flight.
 *  3. Failures retry at full speed. If the API is down, the interval keeps
 *     hammering it. The delay now backs off on consecutive errors and resets
 *     on the first success.
 *
 * @param {() => Promise<unknown>} fn       work to run; kept in a ref so a new
 *                                          closure each render does not restart
 *                                          the timer
 * @param {number|null} intervalMs          base delay; null pauses entirely
 * @param {{ maxBackoffMs?: number }} [opts]
 */
export function usePolling(fn, intervalMs, opts = {}) {
  const { maxBackoffMs = 60000 } = opts;
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!intervalMs) return;

    let cancelled = false;
    let timer = null;
    let inFlight = false;
    let failures = 0;

    const delay = () =>
      failures === 0
        ? intervalMs
        : Math.min(intervalMs * 2 ** failures, maxBackoffMs);

    const schedule = () => {
      clearTimeout(timer);
      if (cancelled || document.visibilityState === 'hidden') return;
      timer = setTimeout(run, delay());
    };

    async function run() {
      if (cancelled || inFlight) return schedule();
      inFlight = true;
      try {
        await fnRef.current();
        failures = 0;
      } catch {
        failures = Math.min(failures + 1, 5);
      } finally {
        inFlight = false;
        schedule();
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(timer);
      } else {
        failures = 0; // a fresh look deserves an immediate, un-backed-off try
        run();
      }
    };

    run();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, maxBackoffMs]);
}

export default usePolling;
