import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { PollProvider } from './context/PollContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PollProvider>
        <App />
      </PollProvider>
    </AuthProvider>
  </StrictMode>,
)
