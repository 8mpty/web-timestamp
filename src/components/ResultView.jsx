import { useEffect, useRef, useState } from 'react';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';
import { drawStamp } from '../utils/drawStamp';

export default function ResultView({ captureData, onRetake }) {
  const { blob: originalBlob, capturedAt, sourceCanvas } = captureData;
  const [dateStr, setDateStr] = useState(() => formatDate(capturedAt));
  const [timeStr, setTimeStr] = useState(() => formatTime(capturedAt));
  const [location, setLocation] = useState(captureData.location || '');
  const [previewUrl, setPreviewUrl] = useState(null);
  const prevUrlRef = useRef(null);

  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = sourceCanvas.width;
    offscreen.height = sourceCanvas.height;
    const ctx = offscreen.getContext('2d');

    let revoked = false;
    const img = new Image();
    const blobUrl = URL.createObjectURL(originalBlob);
    img.onload = () => {
      if (revoked) return;
      ctx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
      drawStamp(ctx, offscreen.width, offscreen.height, dateStr, timeStr, location);
      URL.revokeObjectURL(blobUrl);

      offscreen.toBlob(b => {
        const url = URL.createObjectURL(b);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;
        setPreviewUrl(url);
      }, 'image/jpeg', 0.92);
    };
    img.src = blobUrl;

    return () => {
      revoked = true;
      URL.revokeObjectURL(blobUrl);
    };
  }, [dateStr, timeStr, location, originalBlob, sourceCanvas]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  function handleDownload() {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const d = capturedAt.toISOString().slice(0, 10);
    a.download = `timestamp-${d}.jpg`;
    a.click();
  }

  async function handleShare() {
    if (!previewUrl || !navigator.share) return;
    try {
      const res = await fetch(previewUrl);
      const shareBlob = await res.blob();
      const file = new File([shareBlob], 'timestamp.jpg', { type: 'image/jpeg' });
      await navigator.share({ files: [file], title: 'TimeStamp photo' });
    } catch {
      // user cancelled or API unsupported — silently ignore
    }
  }

  const canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';

  return (
    <div className="result-view">
      <div className="result-view__image-wrap">
        {previewUrl ? (
          <img src={previewUrl} alt="Stamped photo" className="result-view__image" />
        ) : (
          <div className="result-view__loading">Rendering…</div>
        )}
      </div>

      <div className="result-view__controls">
        <div className="stamp-editor">
          <div className="stamp-editor__field">
            <label className="stamp-editor__label" htmlFor="stamp-date">Date</label>
            <input
              id="stamp-date"
              className="stamp-editor__input"
              type="text"
              value={dateStr}
              onChange={e => setDateStr(e.target.value)}
              placeholder="06 Sep 2026"
            />
          </div>
          <div className="stamp-editor__field">
            <label className="stamp-editor__label" htmlFor="stamp-time">Time</label>
            <input
              id="stamp-time"
              className="stamp-editor__input"
              type="text"
              value={timeStr}
              onChange={e => setTimeStr(e.target.value)}
              placeholder="14:32:07"
            />
          </div>
          <div className="stamp-editor__field">
            <label className="stamp-editor__label" htmlFor="stamp-location">
              Location <span className="stamp-editor__optional">(optional)</span>
            </label>
            <input
              id="stamp-location"
              className="stamp-editor__input"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Jurong West, Singapore"
              maxLength={120}
            />
          </div>
        </div>

        <div className="result-view__actions">
          <button className="btn btn--ghost" onClick={onRetake}>
            ↩ Retake
          </button>
          <button className="btn btn--primary" onClick={handleDownload} disabled={!previewUrl}>
            ⬇ Download
          </button>
          {canShare && (
            <button className="btn btn--secondary" onClick={handleShare} disabled={!previewUrl}>
              ↗ Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
