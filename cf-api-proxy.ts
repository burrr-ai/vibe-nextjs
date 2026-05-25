import https from "node:https";

const CF_API_BASE = process.env.CLOUDFLARE_API_BASE_URL;
if (CF_API_BASE) {
  const prismUrl = new URL(CF_API_BASE);
  const prismPathPrefix = prismUrl.pathname.replace("/client/v4", ""); // e.g. "/cf"
  const origRequest = https.request;

  https.request = function (input: any, options?: any, cb?: any) {
    if (typeof input === "string" && input.includes("https://api.cloudflare.com/client/v4")) {
      input = input.replace("https://api.cloudflare.com/client/v4", CF_API_BASE);
      if (options?.path && typeof options.path === "string") {
        options = { ...options, path: prismPathPrefix + options.path };
      }
    }
    // @ts-expect-error monkey-patching https.request
    return origRequest.call(this, input, options, cb);
  } as typeof https.request;
}
