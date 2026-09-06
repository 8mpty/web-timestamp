import { useRef, useState } from 'react';
import LocationInput from './LocationInput';

export default function UploadView({ onCapture, onBack }) {
  const fileInputRef = useRef(null);
  const [location, setLocation] = useState('');
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [error, setError] = useState('');

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setPendingFile(file);
  }

  function handleStamp() {
    if (!pendingFile || !preview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        onCapture({ blob, location, capturedAt: new Date(), sourceCanvas: canvas });
      }, 'image/jpeg', 0.92);
    };
    img.src = preview;
  }

  return (
    <div className="upload-view">
      <div className="upload-view__header">
        <button className="btn btn--ghost btn--sm" onClick={onBack}>← Back</button>
        <h2>Upload a Photo</h2>
      </div>

      <div
        className="upload-view__drop-zone"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Click to select a photo"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="upload-view__preview-img" />
        ) : (
          <>
            <p>Click to choose a photo</p>
            <p className="upload-view__hint">JPG, PNG, WebP, HEIC…</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {error && <p className="upload-view__error">{error}</p>}

      {pendingFile && (
        <div className="upload-view__controls">
          <LocationInput value={location} onChange={setLocation} />
          <div className="upload-view__actions">
            <button className="btn btn--ghost" onClick={() => fileInputRef.current?.click()}>
              Change Photo
            </button>
            <button className="btn btn--primary" onClick={handleStamp}>
              Apply Stamp &amp; Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
