import { useEffect, useState } from 'react';

import { 
  BACKEND_BASE_URL,
  STATS_REQUEST_TIMEOUT,
  STATS_ROUTE,
  STATS_INTERVAL,
} from '../constants';

const STATS_URL = `${BACKEND_BASE_URL}${STATS_ROUTE}`;

/*
  We're expecting data in this shape from GET /stats/:screenId:

  {
    uptimeSeconds: 481203.44,
    memory: { totalKb: 948000, availableKb: 412000 },
    disk:   { totalKb: 30000000, availableKb: 21000000 },
    loadAvg: [0.12, 0.09, 0.05],
    // Convert to tempF in UI
    tempC: 47.2,
    model: "Raspberry Pi Zero W Rev 1.1",
    collectedAt: 1757280000000
  }
*/

export default function useScreenStats(screenId, { enabled }) {
  const [ rawStats, setStats ] = useState(null);
  const [ rawError, setError ] = useState(null);
  const [ prevEnabled, setPrevEnabled ] = useState(enabled);

  // Reset during render (not in an effect) so a re-enable never paints a
  // frame of stats left over from before the screen went offline/rebooted.
  if (enabled !== prevEnabled) {
    setPrevEnabled(enabled);
    setStats(null);
    setError(null);
  }

  // Don't show stats for a screen we already know is down, or one that's rebooting.
  // The caller passes `enabled === STATUS.ONLINE`.
  const stats = enabled ? rawStats : null;
  const error = enabled ? rawError : null;

  useEffect(() => {
    if (!enabled || !Number.isInteger(screenId)) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    let timerId = null;

    const tick = async () => {
      try {
        const response = await fetch(`${STATS_URL}/${screenId}`, {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(STATS_REQUEST_TIMEOUT),
          ]),
        });

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Number.isFinite(data?.uptimeSeconds)) {
          throw new Error(`Malformed stats payload: ${JSON.stringify(data)}`);
        }

        if (cancelled) {
          return;
        }

        console.log(`useScreenStats: Received stats data: `, data);

        setStats(data);
        setError(null);
      }
      catch (error) {
        if (controller.signal.aborted || cancelled) {
          return;
        }

        // Keep a stats failure seperate from a health signal - leave status alone
        //  and keep showing the last good reading
        console.warn(`Stats fetch failed for screen ${screenId}:`, error);
        setError(error);
      }

      if (!cancelled) {
        timerId = setTimeout(tick, STATS_INTERVAL);
      }
    };

    tick();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timerId);
    }

  }, [screenId, enabled]);

  return { stats, error, isStale: Boolean(error && stats) };
}


// ===========================
// Formatting Helper Functions
// ===========================

export function formatUptime(uptimeSeconds) {
  if (!Number.isFinite(uptimeSeconds)) {
    return null;
  }

  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const pad = (n) => String(n).padStart(2, '0');

  return `${days} day${days === 1 ? '' : 's'} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const GB_IN_KB = 1024 * 1024;

export function formatMemory(
  { totalKb, availableKb } = {}, 
  asFraction = true,
  withPercent = true,
) {
  if (!Number.isFinite(totalKb) || !Number.isFinite(availableKb)) {
    return null;
  }

  const usedPercent = Math.round(((totalKb - availableKb) / totalKb) * 100);

  const formatKbAmount = (memoryKbAmount) => memoryKbAmount >= GB_IN_KB
    ? `${(memoryKbAmount / GB_IN_KB).toFixed(1)} GB`
    : `${(memoryKbAmount / 1024).toFixed(0)} MB`;

  const formattedAvailable = formatKbAmount(availableKb);
  const formattedTotal = formatKbAmount(totalKb);
  const formattedUsed = formatKbAmount(totalKb - availableKb);

  if (asFraction) {
    return `${formattedUsed} / ${formattedTotal}${withPercent ? ` (${usedPercent}%)` : ""}`;
  }

  return `${formattedAvailable} free${withPercent ? ` (${usedPercent}%)` : ""}`;
}

export function celsiusToFahrenheit(temperatureCelsius) {
  return (temperatureCelsius * 1.8) + 32;
}
