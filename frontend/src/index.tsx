import './global.scss'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { SnackbarProvider } from './contexts/SnackbarProvider';
import { UserDataProvider } from './contexts/UserDataProvider';
import { ModalProvider } from './contexts/ModalProvider';
import { NavigationProvider } from './contexts/NavigationProvider';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthProvider';
import { MaterialsProvider } from './contexts/MaterialsProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <SnackbarProvider>
        <NavigationProvider>
          <AuthProvider>
            <UserDataProvider>
              <MaterialsProvider>
                <ModalProvider>
                  <AppRouter />
                </ModalProvider>
              </MaterialsProvider>
            </UserDataProvider>
          </AuthProvider>
        </NavigationProvider>
      </SnackbarProvider>
    </Router>
  </React.StrictMode>
);