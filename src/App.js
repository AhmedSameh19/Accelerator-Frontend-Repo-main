import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CRMTypeProvider } from './context/CRMTypeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { TeamMembersProvider } from './context/TeamMembersContext';
import ChickenInvaders from './components/EasterEgg/ChickenInvaders';
import useEasterEgg from './hooks/useEasterEgg';
import NotificationInitializer from './app/NotificationInitializer';
import MembersInitializer from './app/MembersInitializer';
import ErrorBoundary from './app/ErrorBoundary';
import { router } from './routes/router';
import { appTheme } from './theme/appTheme';


import { SnackbarProvider } from './context/SnackbarContext';

function App() {
  const { showGame, setShowGame } = useEasterEgg();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <SnackbarProvider>
          <NotificationsProvider>
            <NotificationInitializer />
            <AuthProvider>
              <TeamMembersProvider>
                <MembersInitializer />
                <CRMTypeProvider>
                  <RouterProvider router={router} />
                  {showGame && <ChickenInvaders onClose={() => setShowGame(false)} />}
                </CRMTypeProvider>
              </TeamMembersProvider>
            </AuthProvider>
          </NotificationsProvider>
        </SnackbarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
