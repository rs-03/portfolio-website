# Article Drafts (one per live demo)

## Automated publishing → dev.to (recommended)

dev.to has a real write API; Medium does not. One-time setup:
1. dev.to → Settings → Extensions → **Generate API key**
2. PowerShell: `$env:DEV_TO_API_KEY = "your-key"`

Then:
```
node scripts/publish_articles.mjs --dry-run   # preview, posts nothing
node scripts/publish_articles.mjs             # uploads all 5 as DRAFTS
node scripts/publish_articles.mjs --publish   # publishes live
```
Published URLs are recorded in `.published.json` (so re-runs skip them) and
printed to the console. Set each demo component's `ARTICLE_URL` constant to
its URL and the "Read the build deep-dive" link appears on the site.

`--update` syncs local markdown edits into the existing dev.to drafts
(matched by title) without creating duplicates.

## Images

`app/scripts/render_article_images.mjs` regenerates `images/` — a branded
cover (1000×420) and a pipeline diagram per article, SVG→PNG via sharp.

In each dev.to draft: use the editor's cover-image button for the
`*-cover.png`, and drag the `*-diagram.png` onto the invisible
`<!-- 👉 drag ... here -->` marker visible in the editor body.

## Manual publishing → Medium (optional, for reach)

Medium's write API is dead; paste a draft into medium.com's editor, add
1–2 screenshots/GIFs of the demo (posts with images perform far better),
and set the canonical link to the dev.to post or the portfolio.
