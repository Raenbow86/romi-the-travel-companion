"use client";

import { FormEvent, useState } from "react";

type Report = {
  id: string;
  name: string;
  area: string;
  notes: string;
  scoutName: string;
  scoutEmail: string;
  status: string;
  returnAgain: string;
  dogFriendly: string;
  pullThrough: string;
  createdAt: string;
};

export default function ReviewPage() {
  const [secret, setSecret] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    const res = await fetch(`/api/scout-reports?secret=${encodeURIComponent(secret)}`);
    const data = await res.json();
    if (!res.ok) {
      setLoaded(false);
      setError(data.error || "Could not open the queue.");
      return;
    }
    setReports(data.reports || []);
    setLoaded(true);
  }

  return (
    <main className="min-h-screen bg-amber-50 px-5 py-8 text-slate-800">
      <section className="mx-auto max-w-md">
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">REVIEW</p>
        <h1 className="mt-2 text-4xl font-black">Scout queue</h1>
        <p className="mt-3 text-sm text-slate-600">
          This is your inbox. Send-back buttons come next. For now you can see every report that left a phone.
        </p>

        <form onSubmit={(e) => void load(e)} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm font-bold">Review secret</span>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-2xl border border-amber-200 px-4 py-3"
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-teal-700 py-3 font-bold text-white">
            Open queue
          </button>
        </form>

        {error ? <p className="mt-4 text-sm font-semibold text-orange-700">{error}</p> : null}

        {loaded && reports.length === 0 ? (
          <p className="mt-6 rounded-3xl bg-white p-4 text-sm text-slate-600">
            Queue is empty. If a scout just submitted and you got the email, DATABASE_URL is not set yet — the report
            is in your inbox only.
          </p>
        ) : null}

        {reports.map((report) => (
          <article key={report.id} className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{report.status}</p>
            <h2 className="font-black">{report.name}</h2>
            <p className="text-sm text-slate-500">{report.area}</p>
            <p className="mt-1 text-sm text-slate-600">
              {report.scoutName} · {report.scoutEmail}
            </p>
            {report.notes ? <p className="mt-2 text-sm text-slate-700">{report.notes}</p> : null}
            <p className="mt-2 text-xs text-slate-500">
              Go back: {report.returnAgain || "—"} · Dogs: {report.dogFriendly || "—"} · Pull-through:{" "}
              {report.pullThrough || "—"}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
