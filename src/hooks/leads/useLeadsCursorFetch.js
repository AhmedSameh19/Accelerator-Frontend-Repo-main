import { useCallback, useEffect, useRef, useState } from 'react';

import { leadsApi } from '../../api/services/leadsApi';

export function useLeadsCursorFetch({ homeLcId, hostLcId, mode } = {}) {
  const fetchSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const nextCursorRef = useRef(null);
  const pendingRef = useRef(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const effectiveMode = mode === 'icx' ? 'icx' : 'default';
  const effectiveLcId = effectiveMode === 'icx' ? hostLcId : homeLcId;

  const fetchNextPage = useCallback(
    async ({ reset } = { reset: false }) => {
      if (!effectiveLcId) {
        console.warn('⚠️ [useLeadsCursorFetch] office LC id is missing:', {
          mode: effectiveMode,
          homeLcId,
          hostLcId,
          effectiveLcId,
          type: typeof effectiveLcId,
          value: effectiveLcId,
        });
        console.warn('💡 [useLeadsCursorFetch] Cannot fetch leads without LC ID. Check user LC configuration.');
        nextCursorRef.current = null;
        pendingRef.current = null;
        setHasMore(false);
        setLeads([]);
        setLoading(false);
        setError(new Error('LC ID is required to fetch leads. Please ensure your user account has an LC assigned.'));
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
          if (effectiveMode === 'icx') {
            console.log('🔍 [useLeadsCursorFetch] Fetching iCX leads for hostLcId:', effectiveLcId);
            page = await leadsApi.getICXLeads({
              host_lc_id: effectiveLcId,
              limit,
              cursor: nextCursorRef.current,
            });
          } else {
            console.log('🔍 [useLeadsCursorFetch] Fetching leads for homeLcId:', effectiveLcId);
            page = await leadsApi.getLeads({
              home_lc_id: effectiveLcId,
              limit,
              cursor: nextCursorRef.current,
            });
          }
          console.log('🔍 [useLeadsCursorFetch] Received page:', page);
        } catch (e) {
          console.error('❌ [useLeadsCursorFetch] Error fetching leads:', e);
          if (fetchSeqRef.current === fetchSeq) {
            setError(e);
            setHasMore(false);
          }
          return;
        }

        if (fetchSeqRef.current !== fetchSeq) return;

        // Handle different response structures
        const rows = page?.items || page?.data || page?.leads || (Array.isArray(page) ? page : []);
        console.log('🔍 [useLeadsCursorFetch] Extracted rows:', rows.length);

        setLeads((prev) => {
          if (fetchSeqRef.current !== fetchSeq) return prev;
          return reset ? rows : [...prev, ...rows];
        });

        nextCursorRef.current = page?.next_cursor ?? page?.cursor ?? null;
        setHasMore(Boolean(nextCursorRef.current) && rows.length > 0);
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
    if (!effectiveLcId) return;
    if (!nextCursorRef.current) return;
    await fetchNextPage({ reset: false });
  }, [fetchNextPage, effectiveLcId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leads, loading, refresh, loadMore, hasMore, error };
}

