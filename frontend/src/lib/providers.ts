/**
 * Single source of truth for every supported payment provider.
 *
 * Before this file, the same provider list was copy-pasted across the
 * marketing site, the dashboard, and both verify pages — which is how the
 * logo paths and provider configs drifted out of sync. Every surface should
 * import from here so there is exactly one place to add or edit a provider.
 *
 * `logo` is a path under /public. Use `null` when we don't have a logo asset
 * yet (e.g. M-Pesa) — the UI falls back to a category icon instead of
 * requesting a missing file and spamming the dev console with 404s.
 */

export type ProviderCategory = "Bank" | "Mobile Money";

export interface Provider {
  id: string;
  /** Full display name, e.g. "Commercial Bank of Ethiopia". */
  name: string;
  /** Short label for compact cards, e.g. "CBE". */
  abbr: string;
  category: ProviderCategory;
  /** Path under /public, or null when no logo asset exists. */
  logo: string | null;
  /** Tailwind gradient used on the verify header / accents. */
  color: string;
  referenceLabel: string;
  referencePlaceholder: string;
  referenceHint: string;
  /** Which inputs the verify form should render. */
  fields: string[];
}

export const PROVIDERS: Provider[] = [
  {
    id: "cbe",
    name: "Commercial Bank of Ethiopia",
    abbr: "CBE",
    category: "Bank",
    logo: "/banks/cbe.png",
    color: "from-[#2E0F4F] to-[#4B1D6B]",
    referenceLabel: "Reference No",
    referencePlaceholder: "FT123456789",
    referenceHint: "Starts with FT....",
    fields: ["reference", "accountSuffix", "image"],
  },
  {
    id: "telebirr",
    name: "Telebirr",
    abbr: "Telebirr",
    category: "Mobile Money",
    logo: "/banks/telebirr.png",
    color: "from-[#003366] to-[#004C99]",
    referenceLabel: "Transaction Number",
    referencePlaceholder: "TBR123456789",
    referenceHint: "Telebirr transaction number",
    fields: ["reference", "image"],
  },
  {
    id: "cbe-birr",
    name: "CBE Birr",
    abbr: "CBE Birr",
    category: "Mobile Money",
    logo: "/banks/cbe-birr.png",
    color: "from-[#2E0F4F] to-[#4B1D6B]",
    referenceLabel: "Receipt Number",
    referencePlaceholder: "CBB123456789",
    referenceHint: "CBE Birr receipt number",
    fields: ["receiptNumber", "phoneNumber", "image"],
  },
  {
    id: "boa",
    name: "Bank of Abyssinia",
    abbr: "BoA",
    category: "Bank",
    logo: "/banks/boa.png",
    color: "from-[#FFD700] to-[#FFC107]",
    referenceLabel: "Reference No",
    referencePlaceholder: "BOA123456789",
    referenceHint: "Bank reference number",
    fields: ["reference", "accountSuffix", "image"],
  },
  {
    id: "awash",
    name: "Awash Bank",
    abbr: "Awash",
    category: "Bank",
    logo: "/banks/awash.png",
    color: "from-[#0A2463] to-[#1E3A8A]",
    referenceLabel: "Reference No",
    referencePlaceholder: "UBH123456789",
    referenceHint: "Awash reference number",
    fields: ["reference", "image"],
  },
  {
    id: "dashen",
    name: "Dashen Bank",
    abbr: "Dashen",
    category: "Bank",
    logo: "/banks/dashen.png",
    color: "from-[#005BAA] to-[#003E7E]",
    referenceLabel: "Reference No",
    referencePlaceholder: "DSH123456789",
    referenceHint: "Dashen bank reference number",
    fields: ["reference", "image"],
  },
  {
    id: "mpesa",
    name: "M-Pesa Ethiopia",
    abbr: "M-Pesa",
    category: "Mobile Money",
    logo: null,
    color: "from-[#DC143C] to-[#FF4D6D]",
    referenceLabel: "Transaction Number",
    referencePlaceholder: "MPESA123456",
    referenceHint: "M-Pesa transaction reference",
    fields: ["reference", "image"],
  },
];

export const PROVIDER_MAP: Record<string, Provider> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p]),
);

export function getProvider(id: string): Provider | undefined {
  return PROVIDER_MAP[id];
}
