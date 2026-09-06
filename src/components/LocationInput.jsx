export default function LocationInput({ value, onChange }) {
  return (
    <div className="location-input">
      <label className="location-input__label" htmlFor="location-field">
        Location <span className="location-input__optional">(optional)</span>
      </label>
      <input
        id="location-field"
        className="location-input__field"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Jurong West, Singapore"
        maxLength={120}
      />
    </div>
  );
}
