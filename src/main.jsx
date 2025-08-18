import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  
import NamjapCounter from './components/NamjapCounter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NamjapCounter/>
  </StrictMode>,
)
