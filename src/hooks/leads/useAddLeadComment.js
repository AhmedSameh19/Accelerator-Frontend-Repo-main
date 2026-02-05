import { useCallback, useState } from 'react';

import { leadsApi } from '../../api/services/leadsApi';

function normalizeComments(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.comments)) return payload.comments;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.comments)) return payload.data.comments;

  return [];
}

export function useAddLeadComment({ leadId, icxApplicationId, isICX = false, onAdded } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addComment = useCallback(
    async (text) => {
      const trimmed = String(text ?? '').trim();
      const effectiveId = isICX ? icxApplicationId : leadId;

      if (!effectiveId) return null;
      if (!trimmed) return null;

      setLoading(true);
      setError(null);

      try {
        const payload = isICX
          ? await leadsApi.addICXComment(effectiveId, trimmed)
          : await leadsApi.addComment(effectiveId, trimmed);
        const comments = normalizeComments(payload);

        if (onAdded) onAdded({ leadId: effectiveId, text: trimmed, comments, raw: payload });

        // If backend returns comments list, return it so caller can update UI.
        return comments.length ? comments : null;
      } catch (e) {
        setError(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [leadId, icxApplicationId, isICX, onAdded],
  );

  return { addComment, loading, error };
}

