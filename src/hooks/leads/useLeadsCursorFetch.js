import { useCallback, useEffect, useRef, useState } from 'react';

import { leadsApi } from '../../api/services/leadsApi';

export function useLeadsCursorFetch({ homeLcId, hostLcId, mode } = {}) {
  const fetchSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -- Server-Side Pagination State --
  const [page, setPage] = useState(0); // MUI uses 0-indexed pages
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  const effectiveMode = mode === 'icx' ? 'icx' : 'default';
  const effectiveLcId = effectiveMode === 'icx' ? hostLcId : homeLcId;

  const fetchLeads = useCallback(
    async ({ searchTerm } = {}) => {
      if (!effectiveLcId) {
        setLeads([]);
        setLoading(false);
        setError(new Error('LC ID is required to fetch leads. Please ensure your user account has an LC assigned.'));
        return;
      }

      if (inFlightRef.current) {
        pendingRef.current = { searchTerm };
        return;
      }

      const fetchSeq = ++fetchSeqRef.current;
      inFlightRef.current = true;

      try {
        setLoading(true);
        setError(null);

        let pageData;
        try {
          if (effectiveMode === 'icx') {
            pageData = await leadsApi.getICXLeads({
              host_lc_id: effectiveLcId,
              limit: rowsPerPage,
              page: page + 1,
              search: searchTerm || undefined
            });
          } else {
            pageData = await leadsApi.getLeads({
              home_lc_id: effectiveLcId,
              limit: rowsPerPage,
              page: page + 1,
              search: searchTerm || undefined
            });
          }
        } catch (e) {
          console.error('❌ [useLeadsCursorFetch] Error fetching leads:', e);
          if (fetchSeqRef.current === fetchSeq) setError(e);
          return;
        }

        if (fetchSeqRef.current !== fetchSeq) return;

        // Handle different response structures
        const rows = pageData?.data || pageData?.items || pageData?.leads || (Array.isArray(pageData) ? pageData : []);

        if (pageData?.pagination?.totalItems !== undefined) {
          setTotalItems(pageData.pagination.totalItems);
        } else {
          setTotalItems(rows.length === rowsPerPage ? (page + 1) * rowsPerPage + 1 : page * rowsPerPage + rows.length);
        }

        setLeads(rows);
      } finally {
        inFlightRef.current = false;
        if (fetchSeqRef.current === fetchSeq) setLoading(false);

        // If another fetch was requested while we were busy, run it next.
        if (fetchSeqRef.current === fetchSeq && pendingRef.current) {
          const next = pendingRef.current;
          pendingRef.current = null;
          void fetchLeads(next);
        }
      }
    },
    [effectiveLcId, effectiveMode, page, rowsPerPage],
  );

  const refresh = useCallback(async ({ searchTerm } = {}) => {
    await fetchLeads({ searchTerm });
  }, [fetchLeads]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { 
    leads, 
    loading, 
    refresh, 
    error,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems
  };
}

