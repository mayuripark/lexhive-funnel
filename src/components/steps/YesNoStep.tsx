interface Props {
  eyebrow: string;
  question: string;
  helper?: string;
  onAnswer: (value: boolean) => void;
}

export default function YesNoStep({ eyebrow, question, helper, onAnswer }: Props) {
  return (
    <div className="step">
      <p className="step-eyebrow">{eyebrow}</p>
      <h1 className="step-question">{question}</h1>
      {helper && <p className="step-helper">{helper}</p>}
      <div className="choice-row">
        <button className="choice-btn" onClick={() => onAnswer(true)}>
          Yes
        </button>
        <button className="choice-btn choice-btn--muted" onClick={() => onAnswer(false)}>
          No
        </button>
      </div>
    </div>
  );
}
