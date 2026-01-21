import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../components/Dashboard/Dashboard';
import LeadApplicationsPage from '../components/Leads/LeadApplicationsPage';

import AuthCallbackPage from '../pages/AuthCallbackPage';
import CalendarPage from '../pages/CalendarPage';
import CampaignsPage from '../pages/CampaignsPage';
import CustomerSurveysPage from '../pages/CustomerSurveysPage';
import EPsBackToProcess from '../pages/EPsBackToProcess';
import FollowUpsPage from '../pages/FollowUpsPage';
import ICXRealizationsPage from '../pages/ICXRealizationsPage';
import LeadProfile from '../pages/leads/LeadProfile';
import LeadsPage from '../pages/leads/LeadsPage';
import LoginPage from '../pages/LoginPage';
import MarketResearchPage from '../pages/MarketResearchPage';
import OGXRealizationsPage from '../pages/leads/OGXRealizationsPage';
import PostLogin from '../pages/PostLogin';
import ProfilePage from '../pages/ProfilePage';
import ReportsPage from '../pages/ReportsPage';
import SignupPage from '../pages/SignupPage';
import VisitsPage from '../pages/VisitsPage';
import AppliedReport from '../pages/reports/AppliedReport';
import AcceptedReport from '../pages/reports/AcceptedReport';
import HostAcceptedReport from '../pages/reports/HostAcceptedReport';
import TopDemandReport from '../pages/reports/TopDemandReport';

import RouteErrorFallback from './RouteErrorFallback';

import { ProtectedRoute, PublicRoute } from './routeGuards';

function publicRoute(element) {
  return <PublicRoute>{element}</PublicRoute>;
}

function protectedRoute(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function protectedLayoutRoute(element) {
  return protectedRoute(<MainLayout>{element}</MainLayout>);
}

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: publicRoute(<LoginPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/post-login',
      element: protectedRoute(<PostLogin />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/signup',
      element: publicRoute(<SignupPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/profile',
      element: protectedRoute(<ProfilePage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/',
      element: protectedLayoutRoute(<Dashboard />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/leads',
      element: protectedLayoutRoute(<LeadsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/leads/:id',
      element: protectedLayoutRoute(<LeadProfile />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/follow-ups',
      element: protectedLayoutRoute(<FollowUpsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/campaigns',
      element: protectedLayoutRoute(<CampaignsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/calendar',
      element: protectedLayoutRoute(<CalendarPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/reports',
      element: protectedLayoutRoute(<ReportsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/reports/applied',
      element: protectedLayoutRoute(<AppliedReport />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/reports/accepted',
      element: protectedLayoutRoute(<AcceptedReport />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/reports/host-accepted',
      element: protectedLayoutRoute(<HostAcceptedReport />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/reports/top-demand',
      element: protectedLayoutRoute(<TopDemandReport />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/market-research',
      element: protectedLayoutRoute(<MarketResearchPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/visits',
      element: protectedLayoutRoute(<VisitsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/ogx-realizations',
      element: protectedLayoutRoute(<OGXRealizationsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/icx-realizations',
      element: protectedLayoutRoute(<ICXRealizationsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/customer-surveys',
      element: protectedLayoutRoute(<CustomerSurveysPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/eps-back-to-process',
      element: protectedLayoutRoute(<EPsBackToProcess />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/lead-applications/:leadId',
      element: protectedRoute(<LeadApplicationsPage />),
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '/auth/callback',
      element: <AuthCallbackPage />,
      errorElement: <RouteErrorFallback />,
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
      errorElement: <RouteErrorFallback />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
    basename: '/',
  },
);
