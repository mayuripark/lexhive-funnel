import { useEffect, useState } from "react";
import ProgressBar from "./components/ProgressBar";
import YesNoStep from "./components/steps/YesNoStep";
import StateStep from "./components/steps/StateStep";
import ContactStep, { type ContactValues } from "./components/steps/ContactStep";
import { ThankYouScreen, DisqualifiedScreen } from "./components/EndScreens";
import { initMetaPixel, trackLead, getFacebookCookies } from "./lib/metaPixel";
import { submitLead, flushQueuedLeads } from "./lib/api";
import { captureAndPersistUtm } from "./lib/utm";
import { RESTRICTED_STATES, type FunnelAnswers, type StepId } from "./types";
import "./funnel.css";

const STEP_ORDER: StepId[] = ["age", "unableToWork", "conditionDuration", "state", "contact"];

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FunnelAnswers>({});
  const [screen, setScreen] = useState<"funnel" | "thankYou" | "disqualified">("funnel");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    initMetaPixel();
    captureAndPersistUtm();
    flushQueuedLeads(); // retry anything stuck from a previous visit
  }, []);

  const currentStep = STEP_ORDER[stepIndex];

  function next(patch: Partial<FunnelAnswers>) {
    setAnswers((a) => ({ ...a, ...patch }));
    setStepIndex((i) => i + 1);
  }

  // A "no" on the age gate is a hard disqualify: we stop before collecting
  // any PII at all, which keeps CPQL clean and avoids storing contact data
  // for people who can never be a fit under this program's criteria.
  function handleAge(value: boolean) {
    if (!value) {
      setScreen("disqualified");
      return;
    }
    next({ ageQualified: true });
  }

  async function handleContactSubmit(contact: ContactValues) {
    setSubmitting(true);
    setSubmitError(false);

    const qualified = Boolean(
      answers.ageQualified && answers.unableToWork && answers.conditionDuration
    );
    const restrictedState = RESTRICTED_STATES.has(answers.state ?? "");
    const eventId = trackLead(); // fires the client-side Meta Pixel Lead event
    const { fbp, fbc } = getFacebookCookies();

    const result = await submitLead({
      ...answers,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      tcpaConsent: contact.tcpaConsent,
      eventId,
      qualified,
      restrictedState,
      landingUrl: window.location.href,
      utm: captureAndPersistUtm(),
      fbp,
      fbc,
      submittedAt: new Date().toISOString(),
    });

    setSubmitting(false);
    setSubmitError(!result.ok);
    setScreen("thankYou");
  }

  if (screen === "disqualified") {
    return (
      <div className="funnel-shell">
        <div className="funnel-card">
          <DisqualifiedScreen />
        </div>
      </div>
    );
  }
  if (screen === "thankYou") {
    return (
      <div className="funnel-shell">
        <div className="funnel-card">
          <ThankYouScreen submitError={submitError} />
        </div>
      </div>
    );
  }

  return (
    <div className="funnel-shell">
      <div className="funnel-card">
        <ProgressBar step={stepIndex + 1} total={STEP_ORDER.length} />

        {currentStep === "age" && (
          <YesNoStep
            eyebrow="Quick eligibility check"
            question="Are you 40 years or older?"
            helper="Age is one factor in benefit eligibility."
            onAnswer={handleAge}
          />
        )}

        {currentStep === "unableToWork" && (
          <YesNoStep
            eyebrow="Step 2 of 5"
            question="Are you currently unable to work due to a medical condition?"
            onAnswer={(value) => next({ unableToWork: value })}
          />
        )}

        {currentStep === "conditionDuration" && (
          <YesNoStep
            eyebrow="Step 3 of 5"
            question="Has your condition lasted, or is it expected to last, 12 months or more?"
            onAnswer={(value) => next({ conditionDuration: value })}
          />
        )}

        {currentStep === "state" && <StateStep onSubmit={(state) => next({ state })} />}

        {currentStep === "contact" && (
          <ContactStep submitting={submitting} onSubmit={handleContactSubmit} />
        )}
      </div>
    </div>
  );
}
