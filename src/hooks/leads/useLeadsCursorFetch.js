import { useCallback, useEffect, useRef, useState } from 'react';

import { leadsApi } from '../../api/services/leadsApi';

export function useLeadsCursorFetch({ homeLcId, hostLcId, mode } = {}) {
  const fetchSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const nextPageRef = useRef(1);
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
        nextPageRef.current = 1;
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
          nextPageRef.current = 1;
          setHasMore(false);
          setLeads([]);
        }

        const limit = 20;
        let pageData;
        try {
          if (effectiveMode === 'icx') {
            pageData = await leadsApi.getICXLeads({
              host_lc_id: effectiveLcId,
              limit,
              page: nextPageRef.current,
            });
          } else {
            pageData = await leadsApi.getLeads({
              home_lc_id: effectiveLcId,
              limit,
              page: nextPageRef.current,
            });
          }
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
        const rows = pageData?.data || pageData?.items || pageData?.leads || (Array.isArray(pageData) ? pageData : []);

        setLeads((prev) => {
          if (fetchSeqRef.current !== fetchSeq) return prev;
          return reset ? rows : [...prev, ...rows];
        });

        if (pageData?.pagination) {
            setHasMore(pageData.pagination.hasNextPage);
            nextPageRef.current = pageData.pagination.hasNextPage ? nextPageRef.current + 1 : null;
        } else {
            // Fallback for old endpoints / mock data
            setHasMore(rows.length === limit);
            nextPageRef.current = rows.length === limit ? nextPageRef.current + 1 : null;
        }
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
    if (!nextPageRef.current) return;
    await fetchNextPage({ reset: false });
  }, [fetchNextPage, effectiveLcId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-fetch next pages in background
  useEffect(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  return { leads, loading, refresh, loadMore, hasMore, error };
}

