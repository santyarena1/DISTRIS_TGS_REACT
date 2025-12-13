import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { PcBuilderProvider } from './context/PcBuilderContext' // Importar

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <PcBuilderProvider> {/* Envolver */}
          <CartProvider>
            <App />
          </CartProvider>
        </PcBuilderProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>,
)