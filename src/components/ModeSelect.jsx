export default function ModeSelect({ onSelect }) {
  return (
    <div className="mode-select">
      <div className="mode-select__hero"></div>

      <div className="mode-select__buttons">
        <button className="btn btn--primary btn--large" onClick={() => onSelect('camera')}>
          Take Photo
        </button>
        <button className="btn btn--secondary btn--large" onClick={() => onSelect('upload')}>
          Upload Photo
        </button>
      </div>
    </div>
  );
}