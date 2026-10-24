import { MinusIcon, PlusIcon } from './Icons';

export default function QuantityStepper({ value, onChange, size = 'md', label = 'Саны' }) {
  return (
    <div className={`stepper stepper-${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Азайту"><MinusIcon /></button>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max="99"
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? value : e.target.value)}
        onFocus={(e) => e.target.select()}
        aria-label={label}
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Көбейту" disabled={value >= 99}><PlusIcon /></button>
    </div>
  );
}
