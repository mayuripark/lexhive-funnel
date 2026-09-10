export function ThankYouScreen({ submitError }: { submitError: boolean }) {
  return (
    <div className="step end-screen">
      <h1 className="step-question">
        You're all set <span className="end-badge end-badge--success end-badge--inline">✓</span>
      </h1>
      <p className="step-helper">
        A specialist will review your answers and reach out shortly to walk through your options.
      </p>
      {submitError && (
        <p className="offline-note">
          We had trouble reaching our server just now — your answers are saved on this device and
          will send automatically the next time you're online.
        </p>
      )}
    </div>
  );
}

export function DisqualifiedScreen() {
  return (
    <div className="step end-screen">
      <div className="end-badge">i</div>
      <h1 className="step-question">Thanks for checking</h1>
      <p className="step-helper">
        Based on your answers, you may not qualify under this program's current criteria. Rules
        vary, so it can still be worth a conversation with a specialist if your situation changes.
      </p>
    </div>
  );
}
