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
<meta name="theme-color" content="#16294A">
<title>Tabi</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(165deg,#16294A 0%,#22406B 55%,#2E5288 100%);min-height:100vh;color:#1C2430;display:flex;align-items:center;justify-content:center;margin:0;padding:20px;box-sizing:border-box;position:relative;overflow:hidden}
body::before{content:"旅";position:fixed;right:-30px;top:-50px;font-family:Georgia,serif;font-size:280px;line-height:1;color:#fff;opacity:.05;pointer-events:none}
form{background:#fff;border:0;border-radius:22px;padding:36px 28px 32px;max-width:340px;width:100%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35);position:relative}
h1{font-size:26px;color:#22406B;margin:0 0 6px}
h1 span{color:#C73E2E;font-size:30px;margin-right:2px}
p{font-size:13.5px;color:#5A6472;margin:0 0 22px}
.pwrow{display:flex;gap:8px;margin-bottom:12px}
input{flex:1;min-width:0;box-sizing:border-box;border:1px solid #E2DCCE;border-radius:12px;padding:13px;font-size:16px;background:#FDFCF8;transition:border-color .15s,box-shadow .15s}
input:focus{outline:none;border-color:#22406B;box-shadow:0 0 0 3px rgba(34,64,107,.15)}
button{width:100%;border:0;border-radius:999px;background:linear-gradient(135deg,#22406B,#33568C);color:#fff;font-size:15px;font-weight:600;padding:13px;cursor:pointer;box-shadow:0 4px 14px rgba(34,64,107,.3);transition:filter .15s,transform .1s}
button:hover{filter:brightness(1.08)}
button:active{transform:scale(.97)}
.pwrow button{width:auto;flex-shrink:0;background:#E9EEF6;color:#22406B;font-size:13px;padding:0 16px;box-shadow:none}
.err{color:#C73E2E;font-size:13px;margin:0 0 12px}
</style>
</head>
<body>
<form method="POST" action="/login">
  <h1><span>旅</span> Tabi</h1>
  <p>This trip is private — enter the trip password.</p>
  ${error ? `<p class="err">${error}</p>` : ""}
  <div class="pwrow">
    <input type="password" id="pw" name="password" placeholder="Trip password" autofocus autocomplete="current-password">
    <button type="button" id="pwtoggle" aria-pressed="false" aria-label="Show password">Show</button>
  </div>
  <button type="submit">Open the trip</button>
</form>
<script>
const pw=document.getElementById("pw"),tg=document.getElementById("pwtoggle");
tg.addEventListener("click",()=>{
 const show=pw.type==="password";
 pw.type=show?"text":"password";
 tg.textContent=show?"Hide":"Show";
 tg.setAttribute("aria-pressed",String(show));
 tg.setAttribute("aria-label",(show?"Hide":"Show")+" password");
 pw.focus();
});
</script>
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
