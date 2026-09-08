import { NextRequest, NextResponse } from "next/server";
import {
  emailNewReport,
  insertReport,
  isAuthorizedReviewer,
  listReports,
  type ScoutReport,
} from "../../lib/scout-reports";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-review-secret");
  if (!isAuthorizedReviewer(secret)) {
    return NextResponse.json({ error: "Review login needed." }, { status: 401 });
  }
  try {
    const reports = await listReports();
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load reports." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad report payload." }, { status: 400 });
  }

  const name = clean(body.name);
  const area = clean(body.area);
  const scoutName = clean(body.scoutName);
  const scoutEmail = clean(body.scoutEmail).toLowerCase();
  const beenThere = clean(body.beenThere);

  if (!name || !area) {
    return NextResponse.json({ error: "Need the place name and the town." }, { status: 400 });
  }
  if (beenThere !== "yes") {
    return NextResponse.json({ error: "Only scout a place you actually went." }, { status: 400 });
  }
  if (!scoutName || !scoutEmail || !scoutEmail.includes("@")) {
    return NextResponse.json({ error: "Need your name and email so we can send a report back." }, { status: 400 });
  }

  const report: ScoutReport = {
    id: clean(body.id) || `${Date.now()}`,
    name,
    area,
    helpsWith: Array.isArray(body.helpsWith) ? body.helpsWith.map((n) => String(n)) : [],
    beenThere,
    pullThrough: clean(body.pullThrough),
    dogFriendly: clean(body.dogFriendly),
    hoursSeen: clean(body.hoursSeen),
    notes: clean(body.notes),
    returnAgain: clean(body.returnAgain),
    status: "pending",
    points: Number(body.points || 0),
    scoutName,
    scoutEmail,
    lat: typeof body.lat === "number" ? body.lat : null,
    lng: typeof body.lng === "number" ? body.lng : null,
    googleWrong: Boolean(body.googleWrong),
    reviewNote: "",
    createdAt: new Date().toISOString(),
  };

  let stored = false;
  let emailed = false;
  const problems: string[] = [];

  try {
    const save = await insertReport(report);
    stored = save.stored;
    if (!stored) problems.push("No DATABASE_URL yet — report was not saved to a table.");
  } catch (error) {
    problems.push(error instanceof Error ? error.message : "Database save failed.");
  }

  try {
    const mail = await emailNewReport(report);
    emailed = mail.emailed;
    if (!emailed) problems.push(mail.reason || "Email did not send.");
  } catch (error) {
    problems.push(error instanceof Error ? error.message : "Email failed.");
  }

  if (!stored && !emailed) {
    return NextResponse.json(
      { ok: false, error: problems.join(" ") || "Report did not leave the phone." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: report.id,
    stored,
    emailed,
    warning: problems.join(" ") || undefined,
  });
}
