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
import ErrorBoundary from './app/ErrorBoundary';
import { router } from './routes/router';
import { appTheme } from './theme/appTheme';

function App() {
  const { showGame, setShowGame } = useEasterEgg();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <NotificationsProvider>
          <NotificationInitializer />
          <AuthProvider>
            <TeamMembersProvider>
              <CRMTypeProvider>
                <RouterProvider router={router} />
                {showGame && <ChickenInvaders onClose={() => setShowGame(false)} />}
              </CRMTypeProvider>
            </TeamMembersProvider>
          </AuthProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
