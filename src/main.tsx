import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Explore from './pages/Explore';
import Featured from './pages/Featured';
import Learn from './pages/Learn';
import Community from './pages/Community';
import Settings from './pages/Settings';
import NeuralTextGenerator from './pages/apps/NeuralTextGenerator';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/explore',
    element: <Explore />,
  },
  {
    path: '/featured',
    element: <Featured />,
  },
  {
    path: '/learn',
    element: <Learn />,
  },
  {
    path: '/community',
    element: <Community />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/apps/neural-text',
    element: <NeuralTextGenerator />,
  },
  {
    path: '/apps/neural-text/:chatId',
    element: <NeuralTextGenerator />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);