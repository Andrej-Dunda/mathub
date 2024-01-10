import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SnackbarProvider } from './contexts/SnackbarProvider';
import { UserDataProvider } from './contexts/UserDataProvider';
import { TokenProvider } from './contexts/TokenProvider';
import { ModalProvider } from './contexts/ModalProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <TokenProvider>
      <UserDataProvider>
        <SnackbarProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </SnackbarProvider>
      </UserDataProvider>
    </TokenProvider>
  </React.StrictMode>
);