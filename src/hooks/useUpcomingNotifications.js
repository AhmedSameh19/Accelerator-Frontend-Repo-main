import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useNotifications } from '../context/NotificationsContext';
import { leadsApi } from '../api/services/leadsApi';
import marketResearchAPI from '../api/services/marketResearchAPI';

// How many hours ahead counts as "upcoming"
const UPCOMING_HOURS = 24;
// How many hours PAST is still considered "due / overdue"
const OVERDUE_LOOK_BACK_HOURS = 48;

function hoursDiff(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - Date.now()) / (1000 * 60 * 60);
  return diff;
}

function formatRelative(dateStr) {
  if (!dateStr) return '';
  const diff = hoursDiff(dateStr);
  if (diff == null) return '';
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 1) return 'just now (overdue)';
    if (absDiff < 24) return `${Math.round(absDiff)}h overdue`;
    return `${Math.round(absDiff / 24)}d overdue`;
  }
  if (diff < 1) return 'in less than 1h';
  if (diff < 24) return `in ${Math.round(diff)}h`;
  return `in ${Math.round(diff / 24)}d`;
}

/**
 * Fetches pending follow-ups and upcoming visits for the current user
 * and injects them into the NotificationsContext on first mount.
 *
 * Call this once inside NotificationInitializer – it runs exactly once per session
 * (tracked via sessionStorage to avoid spamming on re-renders / page refocuses).
 */
export default function useUpcomingNotifications() {
  const { addNotification } = useNotifications();
  const ranRef = useRef(false);

  useEffect(() => {
    // Run once per browser session
    const sessionKey = 'notif_loaded_v1';
    if (ranRef.current || sessionStorage.getItem(sessionKey)) return;
    ranRef.current = true;
    sessionStorage.setItem(sessionKey, '1');

    async function loadNotifications() {
      const personId = Cookies.get('person_id');
      if (!personId) return;

      const now = Date.now();
      const minMs = now - OVERDUE_LOOK_BACK_HOURS * 60 * 60 * 1000;
      const maxMs = now + UPCOMING_HOURS * 60 * 60 * 1000;

      // ── 1. OGX Follow-ups ──────────────────────────────────────────────
      try {
        const ogxFUs = await leadsApi.getFollowUpsCreatedBy();
        const list = Array.isArray(ogxFUs) ? ogxFUs : (ogxFUs?.data ?? []);
        list
          .filter(fu => {
            if (fu.status !== 'pending') return false;
            const ts = new Date(fu.follow_up_at).getTime();
            return ts >= minMs && ts <= maxMs;
          })
          .slice(0, 5)           // cap at 5 to avoid flooding
          .forEach(fu => {
            const diff = hoursDiff(fu.follow_up_at);
            const isOverdue = diff < 0;
            addNotification({
              title: isOverdue ? '⚠️ Overdue OGX Follow-up' : '🔔 Upcoming OGX Follow-up',
              message: `${fu.follow_up_text || 'Follow-up scheduled'} — ${formatRelative(fu.follow_up_at)}`,
              type: isOverdue ? 'error' : 'warning',
              link: '/follow-ups',
            });
          });
      } catch (e) {
        console.warn('[Notifications] Could not load OGX follow-ups:', e.message);
      }

      // ── 2. ICX Follow-ups ──────────────────────────────────────────────
      try {
        const icxFUs = await leadsApi.getICXFollowUpsCreatedBy(personId);
        const list = Array.isArray(icxFUs) ? icxFUs : (icxFUs?.data ?? []);
        list
          .filter(fu => {
            if (fu.status !== 'pending') return false;
            const ts = new Date(fu.follow_up_at).getTime();
            return ts >= minMs && ts <= maxMs;
          })
          .slice(0, 5)
          .forEach(fu => {
            const diff = hoursDiff(fu.follow_up_at);
            const isOverdue = diff < 0;
            addNotification({
              title: isOverdue ? '⚠️ Overdue ICX Follow-up' : '🔔 Upcoming ICX Follow-up',
              message: `${fu.follow_up_text || 'Follow-up scheduled'} — ${formatRelative(fu.follow_up_at)}`,
              type: isOverdue ? 'error' : 'warning',
              link: '/follow-ups',
            });
          });
      } catch (e) {
        console.warn('[Notifications] Could not load ICX follow-ups:', e.message);
      }

      // ── 3. Scheduled Visits (IGV + B2B + Podio) ────────────────────────
      try {
        const visits = await marketResearchAPI.getScheduledVisits();
        const list = Array.isArray(visits) ? visits : (visits?.data ?? []);
        list
          .filter(v => {
            const ts = new Date(v.visit_date).getTime();
            return ts >= minMs && ts <= maxMs;
          })
          .slice(0, 5)
          .forEach(v => {
            const diff = hoursDiff(v.visit_date);
            const isOverdue = diff < 0;
            addNotification({
              title: isOverdue ? '⚠️ Missed Company Visit' : '🏢 Upcoming Company Visit',
              message: `${v.company_name || 'Company'} (${v.source?.toUpperCase() || 'MR'}) — ${formatRelative(v.visit_date)}`,
              type: isOverdue ? 'error' : 'info',
              link: '/visits',
            });
          });
      } catch (e) {
        console.warn('[Notifications] Could not load scheduled visits:', e.message);
      }
    }

    loadNotifications();
  }, [addNotification]);
}
