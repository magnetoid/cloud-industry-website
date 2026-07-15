/* Cloud Industry — imba-cms content hydration
   Backend: imba-cms (https://github.com/magnetoid/imba-cms), which stores
   content in Supabase. Published rows are publicly readable via PostgREST
   with the anon key, so this file fetches them directly — no server needed.

   Configure per page before this script loads:
     window.IMBA_CMS = { url: "https://YOUR-PROJECT.supabase.co", anonKey: "..." };
   Leave url/anonKey empty to disable. Elements opt in with data-cms="path":
     - paths without a prefix resolve against pages_entries.content
       (row slug = <body data-cms-page>), e.g. data-cms="hero.title"
     - paths starting with "site." resolve against site_entries.content
       (row slug = "primary"), e.g. data-cms="site.footer.copyright"
   Add data-cms-html to inject HTML (CMS content is admin-authored);
   default is textContent. Everything fails silent — the copy shipped in
   the HTML is the fallback. See docs/cms-integration.md. */

(async () => {
  "use strict";

  const cfg = window.IMBA_CMS;
  if (!cfg || !cfg.url || !cfg.anonKey) return;

  const base = cfg.url.replace(/\/+$/, "");
  const headers = { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}` };
  const get = async (path) => {
    try {
      const res = await fetch(`${base}/rest/v1/${path}`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null; /* offline / CMS down — keep shipped copy */
    }
  };

  const slug = document.body.dataset.cmsPage || "home";
  const [pageRows, siteRows] = await Promise.all([
    get(`pages_entries?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=seo_title,seo_description,content`),
    get(`site_entries?slug=eq.primary&status=eq.published&select=content`),
  ]);
  const page = pageRows && pageRows[0];
  const site = siteRows && siteRows[0];
  if (!page && !site) return;

  /* SEO comes from the page row's dedicated columns */
  if (page) {
    if (page.seo_title) document.title = page.seo_title;
    if (page.seo_description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", page.seo_description);
    }
  }

  const dig = (obj, path) =>
    path.split(".").reduce((o, key) => (o && typeof o === "object" ? o[key] : undefined), obj);

  document.querySelectorAll("[data-cms]").forEach((el) => {
    const path = el.dataset.cms;
    const value = path.startsWith("site.")
      ? dig(site && site.content, path.slice(5))
      : dig(page && page.content, path);
    if (typeof value !== "string" || value === "") return;
    if (el.hasAttribute("data-cms-html")) el.innerHTML = value;
    else el.textContent = value;
    if (el.dataset.cmsHref === "mailto") el.setAttribute("href", `mailto:${value}`);
  });
})();
