import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { DataProvider } from './context/DataContext'
import { CommandPaletteProvider } from './context/CommandPaletteContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <DataProvider>
          <BrowserRouter>
            <CommandPaletteProvider>
              <App />
            </CommandPaletteProvider>
          </BrowserRouter>
        </DataProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
