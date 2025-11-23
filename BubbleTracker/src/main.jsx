import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StockProvider } from "./assets/lib/StockProvider";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StockProvider>
      <App />
    </StockProvider>
  </StrictMode>,
)
