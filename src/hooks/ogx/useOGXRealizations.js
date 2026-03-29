import { useState, useEffect, useCallback, useRef } from 'react';
import { getRealizations } from '../../api/services/realizationsService';
import { useOfficeId } from '../useOfficeId';

export function useOGXRealizations() {
  const { officeId, isAdmin, currentUser } = useOfficeId({ useAdminOverride: true });
  
  const [leads, setLeads] = useState([]);
  const [originalLeads, setOriginalLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const nextPageRef = useRef(1);

  const fetchNextPage = useCallback(async ({ reset } = { reset: false }) => {
    if (!officeId) {
      setLoading(false);
      return;
    }

    if (inFlightRef.current) return;

    const fetchSeq = ++fetchSeqRef.current;
    inFlightRef.current = true;

    try {
      setLoading(true);
      setError(null);
      if (reset) {
        nextPageRef.current = 1;
        setHasMore(false);
        setLeads([]);
        setOriginalLeads([]);
      }

      const limit = 50;
      const pageData = await getRealizations({
        lcCode: officeId,
        limit,
        page: nextPageRef.current,
      });

      if (fetchSeqRef.current !== fetchSeq) return;

      const rows = pageData?.data || pageData?.items || pageData?.leads || (Array.isArray(pageData) ? pageData : []);

      setLeads((prev) => reset ? rows : [...prev, ...rows]);
      setOriginalLeads((prev) => reset ? rows : [...prev, ...rows]);

      if (pageData?.pagination) {
        setHasMore(pageData.pagination.hasNextPage);
        nextPageRef.current = pageData.pagination.hasNextPage ? nextPageRef.current + 1 : null;
      } else {
        setHasMore(rows.length === limit);
        nextPageRef.current = rows.length === limit ? nextPageRef.current + 1 : null;
      }
    } catch (err) {
      console.error('❌ [useOGXRealizations] Error fetching realizations:', err);
      if (fetchSeqRef.current === fetchSeq) {
        setError('Failed to fetch realizations. Please try again later.');
        setHasMore(false);
      }
    } finally {
      inFlightRef.current = false;
      if (fetchSeqRef.current === fetchSeq) setLoading(false);
    }
  }, [officeId]);

  const refresh = useCallback(() => {
    return fetchNextPage({ reset: true });
  }, [fetchNextPage]);

  const loadMore = useCallback(() => {
    if (!nextPageRef.current) return;
    return fetchNextPage({ reset: false });
  }, [fetchNextPage]);

  const updateLeads = useCallback((updater) => {
    setLeads((prev) => typeof updater === 'function' ? updater(prev) : updater);
    setOriginalLeads((prev) => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  const setFilteredLeads = useCallback((filteredLeads) => {
    setLeads(filteredLeads);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    leads,
    originalLeads,
    loading,
    error,
    hasMore,
    officeId,
    isAdmin,
    currentUser,
    fetchLeads: refresh,
    refresh,
    loadMore,
    updateLeads,
    setFilteredLeads,
  };
}

export default useOGXRealizations;
