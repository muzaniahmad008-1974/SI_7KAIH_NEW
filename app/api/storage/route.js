// app/api/storage/route.js
//
// Thin REST wrapper around lib/driveStore.js so the browser can read/write
// data without ever seeing the Google service-account credentials.
//
//   GET    /api/storage?key=foo              -> { value }
//   GET    /api/storage?prefix=foo            -> { keys: [...] }
//   POST   /api/storage   { key, value }      -> { value }
//   DELETE /api/storage?key=foo               -> { deleted: true }

import { NextResponse } from "next/server";
import { driveGet, driveSet, driveDelete, driveList } from "@/lib/driveStore";

function errorResponse(err) {
  console.error("[/api/storage]", err);
  return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const prefix = searchParams.get("prefix");

  try {
    if (prefix !== null) {
      const keys = await driveList(prefix);
      return NextResponse.json({ keys });
    }
    if (key === null) {
      return NextResponse.json({ error: "Missing 'key' or 'prefix' query parameter" }, { status: 400 });
    }
    const value = await driveGet(key, null);
    return NextResponse.json({ value });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body || typeof body.key !== "string") {
      return NextResponse.json({ error: "Request body must include a string 'key'" }, { status: 400 });
    }
    const value = await driveSet(body.key, body.value);
    return NextResponse.json({ value });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing 'key' query parameter" }, { status: 400 });
  }
  try {
    const result = await driveDelete(key);
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
