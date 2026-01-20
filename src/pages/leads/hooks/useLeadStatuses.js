import { useEffect, useMemo, useRef, useState } from 'react';

import { leadsApi } from '../../../api/services/leadsApi';

function normalizeId(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function normalizeStatusPayload(payload) {
  // Accept common shapes:
  // - { data: {...} }
  // - {...}
  const raw = payload?.data ?? payload ?? null;
  if (!raw || typeof raw !== 'object') return null;

  return {
    contact_status: raw.contact_status ?? raw.new_status ?? raw.contactStatus ?? null,
    interested: raw.interested ?? raw.is_interested ?? raw.interestedStatus ?? null,
    process_status: raw.process_status ?? raw.process ?? raw.processStatus ?? null,
    reason: raw.reason ?? raw.rejection_reason ?? null,
    project: raw.project ?? null,
    country: raw.country ?? null,
  };
}

export function useLeadStatuses(leadIds, { concurrency = 6 } = {}) {
  const idsKey = useMemo(() => {
    const normalized = (Array.isArray(leadIds) ? leadIds : [])
      .map(normalizeId)
      .filter(Boolean);
    // stable key; we don't need perfect ordering, just avoid refetching endlessly
    normalized.sort();
    return normalized.join(',');
  }, [leadIds]);

  const cacheRef = useRef(new Map()); // id -> status | null
  const inFlightRef = useRef(new Map()); // id -> Promise
  const [statusById, setStatusById] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];

    // publish whatever we already have
    const snapshot = {};
    for (const id of ids) {
      if (cacheRef.current.has(id)) snapshot[id] = cacheRef.current.get(id);
    }
    setStatusById(snapshot);

    const missing = ids.filter((id) => !cacheRef.current.has(id) && !inFlightRef.current.has(id));
    if (missing.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      let idx = 0;

      const worker = async () => {
        while (idx < missing.length && !cancelled) {
          const id = missing[idx++];
          if (!id) continue;

          const p = (async () => {
            try {
              const res = await leadsApi.getContactStatus(id);
              const normalized = normalizeStatusPayload(res);
              cacheRef.current.set(id, normalized);
              return normalized;
            } catch (e) {
              cacheRef.current.set(id, null);
              throw e;
            } finally {
              inFlightRef.current.delete(id);
            }
          })();

          inFlightRef.current.set(id, p);

          try {
            await p;
          } catch (e) {
            // keep going; we don't want one failure to stop everything
            if (!cancelled) setError(e);
          }

          if (!cancelled) {
            setStatusById((prev) => ({
              ...prev,
              [id]: cacheRef.current.get(id),
            }));
          }
        }
      };

      const workers = Array.from({ length: Math.max(1, Number(concurrency) || 1) }, () => worker());
      await Promise.allSettled(workers);

      if (!cancelled) setLoading(false);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [idsKey, concurrency]);

  return { statusById, loading, error };
}
