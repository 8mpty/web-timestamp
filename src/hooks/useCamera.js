import { useState, useRef, useEffect, useCallback } from 'react';

export function useCamera() {
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('idle');
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = all.filter(d => d.kind === 'videoinput');
      setDevices(videoInputs);
      return videoInputs;
    } catch {
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId = null) => {
    setPermissionState('requesting');
    setError(null);
    stopStream();

    const constraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: 'environment' },
      audio: false,
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      setStream(newStream);
      setPermissionState('granted');

      const videoInputs = await enumerateDevices();
      if (!deviceId && videoInputs.length > 0) {
        const track = newStream.getVideoTracks()[0];
        const settings = track.getSettings();
        setActiveDeviceId(settings.deviceId || videoInputs[0].deviceId);
      } else {
        setActiveDeviceId(deviceId);
      }
    } catch (err) {
      setPermissionState('denied');
      setError(err.name === 'NotAllowedError'
        ? 'Camera permission was denied. You can still upload a photo instead.'
        : 'Could not access the camera. You can still upload a photo instead.');
    }
  }, [stopStream, enumerateDevices]);

  const switchCamera = useCallback(async (deviceId) => {
    await startCamera(deviceId);
  }, [startCamera]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    devices,
    activeDeviceId,
    stream,
    error,
    permissionState,
    startCamera,
    switchCamera,
    stopStream,
  };
}
