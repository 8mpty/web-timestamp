import { useState } from 'react'
import './App.css'
import ModeSelect from './components/ModeSelect'
import CameraView from './components/CameraView'
import UploadView from './components/UploadView'
import ResultView from './components/ResultView'

function App() {
  const [screen, setScreen] = useState('home')
  const [captureData, setCaptureData] = useState(null)

  function handleCapture(data) {
    setCaptureData(data)
    setScreen('result')
  }

  function handleRetake() {
    setCaptureData(null)
    setScreen('home')
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <ModeSelect onSelect={setScreen} />
      )}
      {screen === 'camera' && (
        <CameraView onCapture={handleCapture} onBack={() => setScreen('home')} />
      )}
      {screen === 'upload' && (
        <UploadView onCapture={handleCapture} onBack={() => setScreen('home')} />
      )}
      {screen === 'result' && captureData && (
        <ResultView captureData={captureData} onRetake={handleRetake} />
      )}
    </div>
);
}
export default App
