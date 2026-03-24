import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
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

import { SnackbarProvider } from './context/SnackbarContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import './theme/tokens.css';

const ThemeAppContent = () => {
  const { theme } = useTheme();
  const { showGame, setShowGame } = useEasterEgg();

  // We'll update appTheme to handle the mode change based on the 'theme' from CustomThemeProvider
  // For now, we'll pass the mode to a function if we refactor appTheme, 
  // but MUI ThemeProvider can also take the theme object directly.
  
  return (
    <ThemeProvider theme={appTheme(theme)}>
      <CssBaseline />
      <ErrorBoundary>
        <SnackbarProvider>
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
        </SnackbarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <ThemeAppContent />
    </CustomThemeProvider>
  );
}

export default App;
