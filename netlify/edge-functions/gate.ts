// Password gate for the whole site.
//
// Netlify's built-in site password is a paid feature, so this edge function
// does the same job on the free tier: every request needs a cookie proving the
// visitor typed the trip password once. The password itself lives in the
// TRIP_PASSWORD environment variable (Netlify UI → Environment variables),
// never in this public repo. If TRIP_PASSWORD is unset, the site is open —
// that keeps a fresh deploy working before the variable is configured.
//
// The cookie stores a SHA-256 of the password (not the password itself), is
// HttpOnly, and lasts a year. API callers (curl, scripts) can skip the cookie
// dance by sending the password in an X-Tabi-Password header instead.

const COOKIE = "tabi_auth";

function getPassword(): string {
  const g = globalThis as Record<string, any>;
  return g.Netlify?.env?.get("TRIP_PASSWORD") ?? g.Deno?.env?.get("TRIP_PASSWORD") ?? "";
}

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get("cookie") ?? "").split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

function loginPage(error = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#22406B">
<title>Tabi</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FAF7F0;color:#1C2430;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box}
form{background:#fff;border:1px solid #D8D2C4;border-radius:12px;padding:28px 24px;max-width:340px;width:100%;text-align:center}
h1{font-size:22px;color:#22406B;margin:0 0 4px}
h1 span{color:#C73E2E}
p{font-size:13.5px;color:#5A6472;margin:0 0 18px}
input{width:100%;box-sizing:border-box;border:1px solid #D8D2C4;border-radius:8px;padding:12px;font-size:16px;background:#FFFDF8;margin-bottom:12px}
button{width:100%;border:0;border-radius:8px;background:#22406B;color:#fff;font-size:15px;font-weight:600;padding:12px;cursor:pointer}
.err{color:#C73E2E;font-size:13px;margin:0 0 12px}
</style>
</head>
<body>
<form method="POST" action="/login">
  <h1><span>旅</span> Tabi</h1>
  <p>This trip is private — enter the trip password.</p>
  ${error ? `<p class="err">${error}</p>` : ""}
  <input type="password" name="password" placeholder="Trip password" autofocus autocomplete="current-password">
  <button type="submit">Open the trip</button>
</form>
</body>
</html>`;
}

const HTML_HEADERS = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const password = getPassword();
  if (!password) return context.next();

  const expected = await sha256hex("tabi|" + password);
  if (getCookie(request, COOKIE) === expected) return context.next();
  if (request.headers.get("x-tabi-password") === password) return context.next();

  const url = new URL(request.url);
  if (request.method === "POST" && url.pathname === "/login") {
    let attempt = "";
    try { attempt = String((await request.formData()).get("password") ?? ""); } catch { /* not a form */ }
    if (attempt === password) {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/",
          "set-cookie": `${COOKIE}=${expected}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }
    return new Response(loginPage("That's not it — try again."), { status: 401, headers: HTML_HEADERS });
  }

  // fetch() callers get JSON, humans get the login form
  if (url.pathname.startsWith("/api/")) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
  }
  return new Response(loginPage(), { status: 401, headers: HTML_HEADERS });
};

// manifest.json is fetched by the browser without cookies, and none of the
// excluded files contain trip content — so the PWA still installs while
// everything with actual data stays behind the gate.
export const config = {
  path: "/*",
  excludedPath: ["/manifest.json", "/icon.svg", "/sw.js"],
};
