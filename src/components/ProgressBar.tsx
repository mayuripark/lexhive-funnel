interface Props {
  step: number;
  total: number;
}

export default function ProgressBar({ step, total }: Props) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
