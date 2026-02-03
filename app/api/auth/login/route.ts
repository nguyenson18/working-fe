import { api } from "@/src/lib/api";
import { unwrap } from "@/src/lib/unwrap";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const data = await unwrap<{ accessToken: string }>(
    api.post("/auth/login", { email, password })
  );

  const accessToken = data.data.accessToken;

  const res = NextResponse.json({ ok: true });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return res;
}
