import React, { useState } from "react";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  domains: string[];
  socialsFollowed: string[];
  consent: "yes" | "no" | "";
};

const DOMAIN_OPTIONS = [
  "Arts and Entertainment",
  "Computing",
  "Consumer Electronics",
  "Coding",
  "Code Execution",
  "Code Interpreter",
  "Economy",
  "Education",
  "Employment",
  "Entertainment",
  "Environment",
  "Food and Drink",
  "Health",
  "History",
  "Home & Garden",
  "Information Technology",
  "Law / Legal",
  "Science",
  "Sports",
  "Technology",
  "Travel",
  "Other",
  "Adversarial Prompting",
  "Aspirational Capability",
  "STEM",
  "Finance",
  "Math",
  "Retrieval Augmented Generation (RAG)",
  "News",
  "Coding - Tool Use",
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/mydeeptech" },
  { label: "X / Twitter", url: "https://x.com/mydeeptech" },
  { label: "Threads", url: "https://www.threads.com/@mydeeptech" },
  { label: "Instagram", url: "https://www.instagram.com/mydeeptech/" },
];

export default function SignUpForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    domains: [],
    socialsFollowed: [],
    consent: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleDomain(domain: string) {
    setForm((s) => {
      const exists = s.domains.includes(domain);
      return { ...s, domains: exists ? s.domains.filter((d) => d !== domain) : [...s.domains, domain] };
    });
  }

  function toggleSocial(label: string) {
    setForm((s) => {
      const exists = s.socialsFollowed.includes(label);
      return { ...s, socialsFollowed: exists ? s.socialsFollowed.filter((d) => d !== label) : [...s.socialsFollowed, label] };
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[+0-9()\-\s]{6,20}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.domains.length === 0) e.domains = "Select at least one domain";
    if (!form.consent) e.consent = "Please choose yes or no";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-2">Thanks — you’re on the list 🎉</h2>
        <p className="text-sm text-muted-foreground">We’ll send updates and paid opportunities to <span className="font-medium">{form.email}</span>.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ fullName: "", phone: "", email: form.email, domains: [], socialsFollowed: [], consent: "" });
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 font-[gilroy-regular] bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-1">Get Paid to Train AI (Up to $30/hr)</h1>
      <p className="mb-4 text-sm text-muted-foreground">We’re building a community for people who want to shape the future of AI. By signing up, you’ll get access to free webinars, trainings, and updates on paid opportunities.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
        <input
          value={form.fullName}
          onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
          className="mt-1 w-full rounded-lg border p-3"
          placeholder="First Name Last Name"
        />
        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
          <input
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            className="mt-1 w-full rounded-lg border p-3"
            placeholder="e.g. +234 81 6554 2639"
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="w-full rounded-lg border p-3"
              placeholder="yourname@domain.co"
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Which domain(s) are you knowledgeable in? (Select all that apply) <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-60 overflow-auto pr-2">
          {DOMAIN_OPTIONS.map((d) => (
            <label key={d} className="inline-flex items-center gap-2 p-2 border rounded-lg">
              <input type="checkbox" checked={form.domains.includes(d)} onChange={() => toggleDomain(d)} />
              <span className="text-sm">{d}</span>
            </label>
          ))}
        </div>
        {errors.domains && <p className="text-xs text-red-600 mt-1">{errors.domains}</p>}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Click the links below to follow us on your favorite platform(s)</label>
        <div className="flex flex-col gap-2 mt-2">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="text-sm underline">
              {s.label}: {s.url}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium">Do you give us permission to keep your information so we can share updates and opportunities with you in the future? <span className="text-red-500">*</span></label>
        <div className="flex gap-6 mt-2 items-center">
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="consent" value="yes" checked={form.consent === "yes"} onChange={() => setForm((s) => ({ ...s, consent: "yes" }))} />
            <span>Yes</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" name="consent" value="no" checked={form.consent === "no"} onChange={() => setForm((s) => ({ ...s, consent: "no" }))} />
            <span>No</span>
          </label>
        </div>
        {errors.consent && <p className="text-xs text-red-600 mt-1">{errors.consent}</p>}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-500">* Indicates required question</div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Join the community"}
        </button>
      </div>

    </form>
  );
}
