import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { unlockAudio } from '@/lib/sound'

// Desbloquea el audio en la primera interacción del usuario (requisito de
// iOS/Safari). Los listeners se auto-remueven tras el primer gesto.
function enableAudioOnFirstGesture() {
  unlockAudio()
  window.removeEventListener('pointerdown', enableAudioOnFirstGesture)
  window.removeEventListener('touchstart', enableAudioOnFirstGesture)
  window.removeEventListener('keydown', enableAudioOnFirstGesture)
}
window.addEventListener('pointerdown', enableAudioOnFirstGesture)
window.addEventListener('touchstart', enableAudioOnFirstGesture)
window.addEventListener('keydown', enableAudioOnFirstGesture)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
