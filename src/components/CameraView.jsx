import { useEffect, useRef, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import LocationInput from './LocationInput';

export default function CameraView({ onCapture, onBack }) {
  const { devices, activeDeviceId, stream, error, permissionState, startCamera, switchCamera } = useCamera();
  const videoRef = useRef(null);
  const [location, setLocation] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startCamera();
    }
  }, [startCamera]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      onCapture({ blob, location, capturedAt: new Date(), sourceCanvas: canvas });
    }, 'image/jpeg', 0.92);
  }

  if (permissionState === 'denied' || error) {
    return (
      <div className="error-screen">
        <span className="error-screen__icon"></span>
        <h2>Camera not available</h2>
        <p>{error}</p>
        <div className="error-screen__buttons">
          <button className="btn btn--primary" onClick={onBack}>
            Upload a Photo Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-view">
      <div className="camera-view__preview-wrap">
        <video
          ref={videoRef}
          className="camera-view__video"
          autoPlay
          muted
          playsInline
        />

        {permissionState === 'requesting' && (
          <div className="camera-view__loading">Starting camera…</div>
        )}

        {devices.length > 1 && permissionState === 'granted' && (
          <div className="camera-view__device-bar">
            <select
              className="camera-view__device-select"
              value={activeDeviceId || ''}
              onChange={e => switchCamera(e.target.value)}
              aria-label="Select camera"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="camera-view__controls">
        <LocationInput value={location} onChange={setLocation} />
        <div className="camera-view__actions">
          <button className="btn btn--ghost btn--sm" onClick={onBack}>
            ← Back
          </button>
          <button
            className="shutter-btn"
            onClick={handleCapture}
            disabled={permissionState !== 'granted'}
            aria-label="Capture photo"
          >
            <span className="shutter-btn__ring" />
          </button>
          <span style={{ width: '4rem' }} />
        </div>
      </div>
    </div>
  );
}