# imba-cms backend integration

The website uses [imba-cms](https://github.com/magnetoid/imba-cms) as its content backend.
imba-cms stores content in Supabase; published rows are publicly readable through Supabase's
auto-generated PostgREST API with the **anon key** (the CMS's RLS migrations grant `SELECT`
to the `anon` role). The static site fetches that API directly from the browser — no server,
no build step. [`js/cms.js`](../js/cms.js) does the fetching and hydration.

## Enable it

1. Run the imba-cms admin (`apps/cms`) against your Supabase project and apply its migrations
   (`packages/*/src/migrations/*.sql`). Admin env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
2. In `index.html` and `tetra.html`, fill the config block near the end of `<body>`:

   ```html
   <script>window.IMBA_CMS = { url: "https://YOUR-PROJECT.supabase.co", anonKey: "eyJ..." };</script>
   ```

   The anon key is publishable — safe to embed. Leaving either field empty disables the CMS
   and the site serves its built-in copy. Any fetch failure also falls back silently.

## Content model

### Pages (`pages_entries` — plugin-pages)

One row per page; the row's `slug` must match `<body data-cms-page="...">`:

| slug | page |
|------|------|
| `home` | index.html |
| `tetra` | tetra.html |

`seo_title` / `seo_description` columns override `<title>` and the meta description.
The `content` JSON feeds `data-cms` paths:

```json
{
  "hero": {
    "eyebrow": "uptime 99.99% · last 90 days",
    "title": "The last host<br>you'll ever<br><em>migrate to.</em>",
    "sub": "Every second your site loads slowly ... <strong>zero downtime.</strong>",
    "assure": "30-day money-back guarantee · No setup fees · Cancel anytime"
  }
}
```

`hero.title`, `hero.sub` and `hero.assure` are injected as HTML (`data-cms-html` — the CMS is
admin-authored); `hero.eyebrow` is plain text. **Rows must have `status = published`** — the
site queries `status=eq.published` explicitly because the pages RLS policy would otherwise
expose drafts.

### Site settings (`site_entries` — plugin-site, row slug `primary`)

```json
{
  "footer": {
    "contactBlurb": "High-performance cloud hosting.<br>Fast. Guarded. Answered in minutes.",
    "copyright": "© 2026 Cloud Industry. All rights reserved."
  }
}
```

## Adding more editable copy

Put `data-cms="some.path"` on any element (add `data-cms-html` if the value contains markup):

- paths without a prefix resolve against the current page row's `content`
- paths starting with `site.` resolve against the `primary` site row's `content`

No JS changes needed — `cms.js` resolves paths generically.
