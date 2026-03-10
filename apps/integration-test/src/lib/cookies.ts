import type { AxiosResponse } from "axios";

export type CookieJar = Map<string, string>;

export function createCookieJar(): CookieJar {
  return new Map();
}

export function storeResponseCookies(jar: CookieJar, response: AxiosResponse) {
  const setCookie = response.headers["set-cookie"];
  const store = (cookie: string) => {
    const [nameValue] = cookie.split(";");
    if (!nameValue) return;
    const eqIdx = nameValue.indexOf("=");
    if (eqIdx === -1) return;
    const name = nameValue.slice(0, eqIdx).trim();
    const value = nameValue.slice(eqIdx + 1).trim();
    if (name) jar.set(name, value);
  };

  if (Array.isArray(setCookie)) {
    setCookie.forEach(store);
  } else if (typeof setCookie === "string") {
    store(setCookie);
  }
}

export function cookieHeader(jar: CookieJar): string | undefined {
  if (jar.size === 0) return undefined;
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

export function authHeaders(jar: CookieJar) {
  const cookie = cookieHeader(jar);
  if (!cookie) return {};
  return {
    Cookie: cookie,
    Origin: "http://localhost:3000",
  };
}
