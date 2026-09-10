import { useState } from "react";
import { US_STATES } from "../../types";

interface Props {
  onSubmit: (state: string) => void;
}

export default function StateStep({ onSubmit }: Props) {
  const [state, setState] = useState("");

  return (
    <div className="step">
      <p className="step-eyebrow">Almost there</p>
      <h1 className="step-question">Which state do you live in?</h1>
      <p className="step-helper">We use this to match you with the right benefits information.</p>
      <select
        className="select-field"
        value={state}
        onChange={(e) => setState(e.target.value)}
        aria-label="Select your state"
      >
        <option value="" disabled>
          Select a state
        </option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      <button className="primary-btn" disabled={!state} onClick={() => onSubmit(state)}>
        Continue
      </button>
    </div>
  );
}
