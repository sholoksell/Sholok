import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MusicProvider } from './context/MusicContext'
import './index.css'

// import.meta.env.MODE is replaced at build time:
//   dev server  → 'development'  → basename '/'      (visit localhost:5182/)
//   production  → 'production'   → basename '/music' (visit /music/ from main app)
const basename = import.meta.env.MODE === 'production' ? '/music' : '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MusicProvider>
        <App />
      </MusicProvider>
    </BrowserRouter>
  </React.StrictMode>
)
