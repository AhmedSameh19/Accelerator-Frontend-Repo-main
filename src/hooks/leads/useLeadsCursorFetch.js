import { useCallback, useEffect, useRef, useState } from 'react';

import { leadsApi } from '../../api/services/leadsApi';

export function useLeadsCursorFetch({ homeLcId }) {
  const fetchSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const nextCursorRef = useRef(null);
  const pendingRef = useRef(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchNextPage = useCallback(
    async ({ reset } = { reset: false }) => {
      if (!homeLcId) {
        nextCursorRef.current = null;
        pendingRef.current = null;
        setHasMore(false);
        setLeads([]);
        setLoading(false);
        setError(null);
        return;
      }

      if (inFlightRef.current) {
        // Don't bump the sequence while a request is in-flight (React 18 StrictMode can
        // call effects twice in dev). Instead, remember the latest requested action.
        pendingRef.current = { reset: Boolean(reset) };
        return;
      }

      const fetchSeq = ++fetchSeqRef.current;
      inFlightRef.current = true;

      try {
        setLoading(true);
        setError(null);
        if (reset) {
          nextCursorRef.current = null;
          setHasMore(false);
          setLeads([]);
        }

        const limit = 10;
        let page;
        try {
          page = await leadsApi.getLeads({
            home_lc_id: homeLcId,
            limit,
            cursor: nextCursorRef.current,
          });
        } catch (e) {
          if (fetchSeqRef.current === fetchSeq) {
            setError(e);
            setHasMore(false);
          }
          return;
        }

        if (fetchSeqRef.current !== fetchSeq) return;

        const rows = page?.items || [];

        setLeads((prev) => {
          if (fetchSeqRef.current !== fetchSeq) return prev;
          return reset ? rows : [...prev, ...rows];
        });

        nextCursorRef.current = page?.next_cursor ?? null;
        setHasMore(Boolean(page?.next_cursor) && rows.length > 0);
      } finally {
        inFlightRef.current = false;
        if (fetchSeqRef.current === fetchSeq) setLoading(false);

        // If another fetch was requested while we were busy, run it next.
        if (fetchSeqRef.current === fetchSeq && pendingRef.current) {
          const next = pendingRef.current;
          pendingRef.current = null;
          // Fire-and-forget; state updates are guarded by fetchSeq.
          void fetchNextPage(next);
        }
      }
    },
    [homeLcId],
  );

  const refresh = useCallback(async () => {
    await fetchNextPage({ reset: true });
  }, [fetchNextPage]);

  const loadMore = useCallback(async () => {
    if (!homeLcId) return;
    if (!nextCursorRef.current) return;
    await fetchNextPage({ reset: false });
  }, [fetchNextPage, homeLcId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leads, loading, refresh, loadMore, hasMore, error };
}

