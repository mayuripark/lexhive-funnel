// Restricted states: firms often can't accept SSD/Mass Tort leads from states
// where the intake attorney isn't licensed, or where local advertising rules
// apply. This is a stub list — in production this would come from the
// backend/Airtable so it can change without a redeploy.
export const RESTRICTED_STATES = new Set(["MH", "DL"]); // placeholder — replace with real list

export const US_STATES: { code: string; name: string }[] = [
  { code: "AP", name: "Andhra Pradesh" }, { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" }, { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" }, { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" }, { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" }, { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" }, { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" }, { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" }, { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" }, { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" }, { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" }, { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" }, { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" }, { code: "WB", name: "West Bengal" },
  { code: "AN", name: "Andaman and Nicobar Islands" }, { code: "CH", name: "Chandigarh" },
  { code: "DNHDD", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" }, { code: "JK", name: "Jammu and Kashmir" },
  { code: "LA", name: "Ladakh" }, { code: "LD", name: "Lakshadweep" },
  { code: "PY", name: "Puducherry" },
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
