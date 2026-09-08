export type ScoutReportStatus = "pending" | "needs_fix" | "resubmitted" | "approved" | "rejected";

export type ScoutReport = {
  id: string;
  name: string;
  area: string;
  helpsWith: string[];
  beenThere: string;
  pullThrough: string;
  dogFriendly: string;
  hoursSeen: string;
  notes: string;
  returnAgain: string;
  status: ScoutReportStatus;
  points: number;
  scoutName: string;
  scoutEmail: string;
  lat: number | null;
  lng: number | null;
  googleWrong: boolean;
  reviewNote: string;
  createdAt: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  return value?.trim() || "";
}

export function reviewInbox() {
  return requiredEnv("REVIEW_INBOX");
}

export function reviewSecret() {
  return requiredEnv("REVIEW_SECRET");
}

export function isAuthorizedReviewer(secret: string | null) {
  const expected = reviewSecret();
  return Boolean(expected) && secret === expected;
}

async function sql(query: string, params: unknown[] = []) {
  const url = requiredEnv("DATABASE_URL");
  if (!url) return null;
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(url);
  return db.query(query, params);
}

export async function ensureReportsTable() {
  if (!requiredEnv("DATABASE_URL")) return false;
  await sql(`
    CREATE TABLE IF NOT EXISTS scout_reports (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      area TEXT NOT NULL,
      helps_with TEXT[] DEFAULT '{}',
      been_there TEXT DEFAULT '',
      pull_through TEXT DEFAULT '',
      dog_friendly TEXT DEFAULT '',
      hours_seen TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      return_again TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      points INTEGER DEFAULT 0,
      scout_name TEXT DEFAULT '',
      scout_email TEXT DEFAULT '',
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      google_wrong BOOLEAN DEFAULT FALSE,
      review_note TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  return true;
}

function rowToReport(row: Record<string, unknown>): ScoutReport {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    area: String(row.area || ""),
    helpsWith: Array.isArray(row.helps_with) ? (row.helps_with as string[]) : [],
    beenThere: String(row.been_there || ""),
    pullThrough: String(row.pull_through || ""),
    dogFriendly: String(row.dog_friendly || ""),
    hoursSeen: String(row.hours_seen || ""),
    notes: String(row.notes || ""),
    returnAgain: String(row.return_again || ""),
    status: (row.status as ScoutReportStatus) || "pending",
    points: Number(row.points || 0),
    scoutName: String(row.scout_name || ""),
    scoutEmail: String(row.scout_email || ""),
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    googleWrong: Boolean(row.google_wrong),
    reviewNote: String(row.review_note || ""),
    createdAt: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
  };
}

export async function insertReport(report: ScoutReport) {
  const ready = await ensureReportsTable();
  if (!ready) return { stored: false as const };
  await sql(
    `INSERT INTO scout_reports (
      id, name, area, helps_with, been_there, pull_through, dog_friendly,
      hours_seen, notes, return_again, status, points, scout_name, scout_email,
      lat, lng, google_wrong, review_note, created_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
    )`,
    [
      report.id,
      report.name,
      report.area,
      report.helpsWith,
      report.beenThere,
      report.pullThrough,
      report.dogFriendly,
      report.hoursSeen,
      report.notes,
      report.returnAgain,
      report.status,
      report.points,
      report.scoutName,
      report.scoutEmail,
      report.lat,
      report.lng,
      report.googleWrong,
      report.reviewNote,
      report.createdAt,
    ],
  );
  return { stored: true as const };
}

export async function listReports() {
  const ready = await ensureReportsTable();
  if (!ready) return [];
  const rows = (await sql(
    `SELECT * FROM scout_reports ORDER BY created_at DESC LIMIT 200`,
  )) as Record<string, unknown>[] | null;
  return (rows || []).map(rowToReport);
}

export async function emailNewReport(report: ScoutReport) {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const to = reviewInbox();
  if (!apiKey || !to) {
    return { emailed: false as const, reason: "missing RESEND_API_KEY or REVIEW_INBOX" };
  }
  const from = requiredEnv("RESEND_FROM") || "ROMI Scouts <beth.t@example.com>";
  const lines = [
    `${report.scoutName} <${report.scoutEmail}> scouted ${report.name}`,
    `Where: ${report.area}`,
    `Go back: ${report.returnAgain || "—"}`,
    `Dogs: ${report.dogFriendly || "—"}`,
    `Pull-through: ${report.pullThrough || "—"}`,
    `Hours seen: ${report.hoursSeen || "—"}`,
    `Needs: ${report.helpsWith.join(", ") || "—"}`,
    `Google wrong: ${report.googleWrong ? "flagged" : "no"}`,
    `Pin: ${report.lat != null && report.lng != null ? `${report.lat}, ${report.lng}` : "none"}`,
    "",
    report.notes || "(no notes)",
    "",
    `Review: ${requiredEnv("NEXT_PUBLIC_APP_URL") || "https://romi-the-travel-companion.vercel.app"}/review`,
  ];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: report.scoutEmail || undefined,
      subject: `Scout report: ${report.name}`,
      text: lines.join("\n"),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { emailed: false as const, reason: body.slice(0, 300) };
  }
  return { emailed: true as const };
}
