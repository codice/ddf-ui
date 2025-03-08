import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './tailwind.css'
import { Theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme>
      <App />
    </Theme>
  </React.StrictMode>
)
