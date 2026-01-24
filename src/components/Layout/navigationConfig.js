import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Campaign as CampaignIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  MeetingRoom as MeetingRoomIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarMonthIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';

export const DRAWER_WIDTH = 240;
export const COLLAPSED_DRAWER_WIDTH = 73;

export function getMenuItems(crmType) {
  return [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      show: true,
    },
    {
      text: 'Leads',
      icon: <PeopleIcon />,
      path: '/leads',
      show: crmType === 'oGX' || crmType === 'B2C',
    },
    {
      text: 'Campaigns',
      icon: <CampaignIcon />,
      path: '/campaigns',
      show: crmType === 'B2C',
    },
    {
      text: 'Customer Surveys',
      icon: <AssessmentIcon />,
      path: '/customer-surveys',
      show: crmType === 'B2C',
    },
    {
      text: 'Market Research',
      icon: <SearchIcon />,
      path: '/market-research',
      show: crmType === 'iCX',
    },
    {
      text: 'Visits',
      icon: <MeetingRoomIcon />,
      path: '/visits',
      show: crmType === 'iCX',
    },
    {
      text: 'Follow-ups',
      icon: <EventNoteIcon />,
      path: '/follow-ups',
      show: true,
    },
    {
      text: 'Realizations',
      icon: <CheckCircleIcon />,
      path: crmType === 'oGX' ? '/ogx-realizations' : '/icx-realizations',
      show: crmType === 'oGX' || crmType === 'iCX',
    },
    {
      text: 'Calendar',
      icon: <CalendarMonthIcon />,
      path: '/calendar',
      show: true,
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      show: false,
    },
    {
      text: 'EPs Back to Process',
      icon: <RestoreIcon />,
      path: '/eps-back-to-process',
      show: crmType === 'oGX' || crmType === 'B2C',
    },
  ];
}

export function getActiveMenuTitle(menuItems, pathname) {
  return menuItems.find((item) => item.show && item.path === pathname)?.text || 'Dashboard';
}
