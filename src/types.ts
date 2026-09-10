// Restricted states: firms often can't accept SSD/Mass Tort leads from states
// where the intake attorney isn't licensed, or where local advertising rules
// apply. This is a stub list — in production this would come from the
// backend/Airtable so it can change without a redeploy.
export const RESTRICTED_STATES = new Set(["CA", "NY"]);

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
  "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
  "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export interface FunnelAnswers {
  ageQualified?: boolean;
  unableToWork?: boolean;
  conditionDuration?: boolean;
  state?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tcpaConsent?: boolean;
}

export interface LeadPayload extends FunnelAnswers {
  eventId: string;
  qualified: boolean;
  restrictedState: boolean;
  landingUrl: string;
  utm: Record<string, string>;
  fbp?: string;
  fbc?: string;
  submittedAt: string;
}

export type StepId =
  | "age"
  | "unableToWork"
  | "conditionDuration"
  | "state"
  | "contact"
  | "thankYou"
  | "disqualified";
