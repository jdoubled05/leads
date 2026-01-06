"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import { scoreLead } from "@/lib/leadScoring";
import { supabaseClient } from "@/lib/supabaseClient";
import { trackAdsConversion } from "@/lib/gtag";

type PropertyType = "single_family" | "condo_townhome" | "2_4_unit";
type UseCase =
  | "home_improvement"
  | "debt_consolidation"
  | "emergency"
  | "education"
  | "other";
type Timeline = "0-30" | "1-3" | "3-6" | "research";
type CreditBand = "740+" | "700-739" | "660-699" | "<660" | "not_sure";

type FormState = {
  zip: string;
  primaryResidence: boolean | null;
  propertyType: PropertyType;
  estHomeValue: number;
  mortgageBalance: number;
  useCase: UseCase;
  timeline: Timeline;
  creditBand: CreditBand;
  firstName: string;
  email: string;
  consentEmailOnly: boolean;
};

const steps = [
  "Property basics",
  "Equity estimate",
  "Planned use",
  "Timing",
  "Credit range",
  "Results",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function HelocLeadPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const hasTrackedConversion = useRef(false);
  const [form, setForm] = useState<FormState>({
    zip: "",
    primaryResidence: null,
    propertyType: "single_family",
    estHomeValue: 450000,
    mortgageBalance: 220000,
    useCase: "home_improvement",
    timeline: "1-3",
    creditBand: "700-739",
    firstName: "",
    email: "",
    consentEmailOnly: false,
  });

  const estEquity = useMemo(
    () => Math.max(0, form.estHomeValue - form.mortgageBalance),
    [form.estHomeValue, form.mortgageBalance]
  );

  const availableLow = Math.round(estEquity * 0.35);
  const availableHigh = Math.round(estEquity * 0.55);

  const goNext = () => {
    setError(null);
    if (!validateStep(step)) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!/^\d{5}$/.test(form.zip)) {
        setError("Please enter a 5-digit ZIP code.");
        return false;
      }
      if (form.primaryResidence === null) {
        setError("Please tell us if this is your primary residence.");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const estHomeValue = Number(form.estHomeValue);
      const mortgageBalance = Number(form.mortgageBalance);

      if (Number.isNaN(estHomeValue) || Number.isNaN(mortgageBalance)) {
        setError(
          "Please enter valid numbers for home value and mortgage balance."
        );
        return false;
      }

      if (estHomeValue < 50000 || estHomeValue > 10000000) {
        setError(
          "That home value looks unusual. Please double-check the amount (example: 450000)."
        );
        return false;
      }

      if (mortgageBalance < 0 || mortgageBalance > 10000000) {
        setError(
          "That mortgage balance looks unusual. Please double-check the amount."
        );
        return false;
      }

      if (mortgageBalance > estHomeValue) {
        setError(
          "Mortgage balance should be less than or equal to the home value."
        );
        return false;
      }
      return true;
    }

    if (currentStep === 6) {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (!form.consentEmailOnly) {
        setError("Please confirm email-only contact to continue.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateStep(6)) {
      return;
    }

    const supabaseReady = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (!supabaseReady) {
      setError("We are unable to save your details right now.");
      return;
    }

    const estHomeValue = Number(form.estHomeValue);
    const mortgageBalance = Number(form.mortgageBalance);

    if (Number.isNaN(estHomeValue) || Number.isNaN(mortgageBalance)) {
      setError("Please provide valid numeric values for the estimate.");
      return;
    }

    const calculatedEquity = Math.max(0, estHomeValue - mortgageBalance);

    const { score, tier } = scoreLead({
      estEquity: calculatedEquity,
      timeline: form.timeline,
      creditBand: form.creditBand,
      primaryResidence: Boolean(form.primaryResidence),
      useCase: form.useCase,
    });

    setIsSubmitting(true);

    const insertPayload = {
      zip: form.zip,
      primary_residence: Boolean(form.primaryResidence),
      property_type: form.propertyType,
      est_home_value: estHomeValue,
      mortgage_balance: mortgageBalance,
      est_equity: calculatedEquity,
      use_case: form.useCase,
      timeline: form.timeline,
      credit_band: form.creditBand,
      first_name: form.firstName || null,
      email: form.email,
      lead_score: score,
      lead_tier: tier,
    };

    const { error: insertError } = await supabaseClient
      .from("leads")
      .insert(insertPayload);

    setIsSubmitting(false);

    if (insertError) {
      setError("We could not save your details. Please try again.");
      return;
    }

    setSubmitted(true);

    const conversionLabel =
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (!hasTrackedConversion.current && conversionLabel) {
      trackAdsConversion(`AW-17850908521/${conversionLabel}`);
      hasTrackedConversion.current = true;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ee] text-[#1c1b1a]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(249,208,165,0.8),_transparent_55%),radial-gradient(circle_at_80%_0%,_rgba(191,221,214,0.8),_transparent_50%),radial-gradient(circle_at_30%_70%,_rgba(198,210,248,0.7),_transparent_55%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 md:px-12">
          <PublicHeader />
          <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5d5a54]">
                Home Equity Check
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
                Estimate your potential HELOC range
              </h1>
              <p className="mt-3 max-w-xl text-sm text-[#5d5a54]">
                This is an informational tool only. It does not impact your
                credit or offer a loan.
              </p>
            </div>
            <div className="rounded-full border border-[#1c1b1a]/15 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
              Step {step} of {steps.length}
            </div>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[32px] border border-[#1c1b1a]/10 bg-white/80 p-8 shadow-[0_24px_80px_-50px_rgba(28,27,26,0.6)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d5a54]">
                  {steps[step - 1]}
                </span>
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <span
                      key={`step-dot-${index}`}
                      className={`h-2 w-8 rounded-full ${
                        index + 1 <= step
                          ? "bg-[#1c1b1a]"
                          : "bg-[#1c1b1a]/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {submitted ? (
                <div className="mt-10 space-y-4">
                  <h2 className="text-2xl font-semibold">
                    Thank you. We&apos;ve received your details.
                  </h2>
                  <p className="text-[#4a4742]">
                    We&apos;ll email you additional information and next steps.
                    No phone calls.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-[#1c1b1a]/20 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1c1b1a] transition hover:border-[#1c1b1a]/40"
                  >
                    Return home
                  </Link>
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                          <label className="text-sm font-semibold">ZIP code</label>
                          <input
                            value={form.zip}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                zip: event.target.value,
                              }))
                            }
                            placeholder="12345"
                            maxLength={5}
                            className="mt-2 w-full rounded-2xl border border-[#1c1b1a]/20 bg-white px-4 py-3 text-base outline-none transition focus:border-[#1c1b1a]"
                          />
                          <p className="mt-2 text-xs text-[#5d5a54]">
                            Used to estimate home values in your area. No impact
                            to credit.
                          </p>
                        </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold">
                          Is this your primary residence?
                        </p>
                        <div className="flex gap-3">
                          {[
                            { label: "Yes", value: true },
                            { label: "No", value: false },
                          ].map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  primaryResidence: option.value,
                                }))
                              }
                              className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                                form.primaryResidence === option.value
                                  ? "border-[#1c1b1a] bg-[#1c1b1a] text-[#f8f4ee]"
                                  : "border-[#1c1b1a]/20 bg-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold">
                          Property type
                        </label>
                        <div className="mt-2 grid gap-3 md:grid-cols-3">
                          {[
                            {
                              label: "Single family",
                              value: "single_family",
                            },
                            {
                              label: "Condo / Townhome",
                              value: "condo_townhome",
                            },
                            { label: "2-4 Unit", value: "2_4_unit" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  propertyType: option.value as PropertyType,
                                }))
                              }
                              className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                                form.propertyType === option.value
                                  ? "border-[#1c1b1a] bg-[#1c1b1a] text-[#f8f4ee]"
                                  : "border-[#1c1b1a]/20 bg-white"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Estimated home value</span>
                          <span className="text-[#5d5a54]">
                            {formatCurrency(form.estHomeValue)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={50000}
                          max={2000000}
                          step={5000}
                          value={form.estHomeValue}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              estHomeValue: Number(event.target.value),
                              mortgageBalance: Math.min(
                                prev.mortgageBalance,
                                Number(event.target.value)
                              ),
                            }))
                          }
                          className="mt-3 w-full accent-[#1c1b1a]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Current mortgage balance</span>
                          <span className="text-[#5d5a54]">
                            {formatCurrency(form.mortgageBalance)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={form.estHomeValue}
                          step={5000}
                          value={form.mortgageBalance}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              mortgageBalance: Number(event.target.value),
                            }))
                          }
                          className="mt-3 w-full accent-[#1c1b1a]"
                        />
                      </div>
                      <div className="rounded-2xl border border-[#1c1b1a]/15 bg-[#f8f4ee] px-4 py-3 text-sm text-[#3f3c37]">
                        Estimated equity:{" "}
                        <span className="font-semibold">
                          {formatCurrency(estEquity)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5d5a54]">
                        Equity is calculated as home value minus mortgage
                        balance. This is informational only.
                      </p>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#5d5a54]">
                        Helps us tailor informational guidance for common HELOC
                        use cases.
                      </p>
                      {[
                        {
                          label: "Home improvements or repairs",
                          value: "home_improvement",
                        },
                        {
                          label: "Debt consolidation",
                          value: "debt_consolidation",
                        },
                        { label: "Emergency", value: "emergency" },
                        { label: "Education", value: "education" },
                        { label: "Other", value: "other" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              useCase: option.value as UseCase,
                            }))
                          }
                          className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                            form.useCase === option.value
                              ? "border-[#1c1b1a] bg-[#1c1b1a] text-[#f8f4ee]"
                              : "border-[#1c1b1a]/20 bg-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#5d5a54]">
                        Timing provides context for educational resources.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                      {[
                        { label: "0-30 days", value: "0-30" },
                        { label: "1-3 months", value: "1-3" },
                        { label: "3-6 months", value: "3-6" },
                        { label: "Just researching", value: "research" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              timeline: option.value as Timeline,
                            }))
                          }
                          className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                            form.timeline === option.value
                              ? "border-[#1c1b1a] bg-[#1c1b1a] text-[#f8f4ee]"
                              : "border-[#1c1b1a]/20 bg-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-3">
                      <p className="text-xs text-[#5d5a54]">
                        Credit range helps estimate general HELOC availability.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                      {[
                        { label: "740+", value: "740+" },
                        { label: "700-739", value: "700-739" },
                        { label: "660-699", value: "660-699" },
                        { label: "<660", value: "<660" },
                        { label: "Not sure", value: "not_sure" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              creditBand: option.value as CreditBand,
                            }))
                          }
                          className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                            form.creditBand === option.value
                              ? "border-[#1c1b1a] bg-[#1c1b1a] text-[#f8f4ee]"
                              : "border-[#1c1b1a]/20 bg-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-[#1c1b1a]/15 bg-[#f8f4ee] px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d5a54]">
                          Estimated available range
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          {formatCurrency(availableLow)} -{" "}
                          {formatCurrency(availableHigh)}
                        </p>
                        <p className="mt-2 text-xs text-[#5d5a54]">
                          This is a general estimate only and not a guarantee of
                          available credit.
                        </p>
                      </div>

                      <p className="text-sm text-[#4a4742]">
                        If you&apos;d like a summary and next steps by email,
                        share your details below.
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-semibold">
                            First name (optional)
                          </label>
                          <input
                            value={form.firstName}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                firstName: event.target.value,
                              }))
                            }
                            placeholder="Optional"
                            className="mt-2 w-full rounded-2xl border border-[#1c1b1a]/20 bg-white px-4 py-3 text-base outline-none transition focus:border-[#1c1b1a]"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">
                            Email
                          </label>
                          <input
                            value={form.email}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                email: event.target.value,
                              }))
                            }
                            placeholder="you@email.com"
                            className="mt-2 w-full rounded-2xl border border-[#1c1b1a]/20 bg-white px-4 py-3 text-base outline-none transition focus:border-[#1c1b1a]"
                          />
                          <p className="mt-2 text-xs text-[#5d5a54]">
                            We will only email your results and options.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 rounded-2xl border border-[#1c1b1a]/15 bg-white px-4 py-3 text-sm text-[#4a4742]">
                        <input
                          type="checkbox"
                          checked={form.consentEmailOnly}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              consentEmailOnly: event.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 accent-[#1c1b1a]"
                        />
                        <span>
                          I consent to receive email-only information related to
                          my home equity estimate.
                        </span>
                      </label>

                      <p className="text-xs text-[#5d5a54]">
                        Not a lender. Estimates are informational only.{" "}
                        <Link className="underline" href="/privacy">
                          Privacy
                        </Link>{" "}
                        ·{" "}
                        <Link className="underline" href="/terms">
                          Terms
                        </Link>
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className={`rounded-full border border-[#1c1b1a]/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        step === 1
                          ? "cursor-not-allowed text-[#1c1b1a]/40"
                          : "text-[#1c1b1a] hover:border-[#1c1b1a]/40"
                      }`}
                      disabled={step === 1}
                    >
                      Back
                    </button>

                    {step < steps.length ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="rounded-full bg-[#1c1b1a] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8f4ee] transition hover:bg-[#2e2a24]"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-full bg-[#1c1b1a] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f8f4ee] transition hover:bg-[#2e2a24] disabled:cursor-not-allowed disabled:bg-[#514c44]"
                      >
                        {isSubmitting ? "Submitting..." : "Send my info"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-[#1c1b1a]/10 bg-white/70 p-6 shadow-[0_18px_50px_-40px_rgba(28,27,26,0.6)]">
                <h2 className="text-lg font-semibold">Summary</h2>
                <div className="mt-4 space-y-3 text-sm text-[#4a4742]">
                  <p>
                    ZIP: <span className="font-semibold">{form.zip || "—"}</span>
                  </p>
                  <p>
                    Estimated equity:{" "}
                    <span className="font-semibold">
                      {formatCurrency(estEquity)}
                    </span>
                  </p>
                  <p>
                    Use case:{" "}
                    <span className="font-semibold">
                      {form.useCase.replace("_", " ")}
                    </span>
                  </p>
                  <p>
                    Timeline: <span className="font-semibold">{form.timeline}</span>
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#1c1b1a]/10 bg-[#1c1b1a] p-6 text-sm text-[#f8f4ee]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7d0c5]">
                  How this works
                </p>
                <p className="mt-3 text-base font-semibold">
                  This tool provides an informational estimate.
                </p>
                <p className="mt-3 text-[#d7d0c5]">
                  We use your inputs to calculate a general equity range. It
                  does not impact credit and is not a loan offer.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
