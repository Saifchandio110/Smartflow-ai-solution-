# SmartFlow AI Solution website

Plain HTML/CSS/JS. No build step, no dependencies. Files: `index.html`, `styles.css`, `script.js`, `favicon.svg`, `robots.txt`.

## Publish from your Android phone (GitHub Pages)
1. In your phone browser, open github.com and sign in (use "Desktop site" in browser menu for easier layout).
2. Tap **+ > New repository**. Name it `smartflow-ai`, set **Public**, tap **Create repository**.
3. Tap **uploading an existing file** (or Add file > Upload files). Select all 5 files from your phone's Downloads. Upload them at the top level (not inside a folder). Tap **Commit changes**.
4. Go to **Settings > Pages**. Under **Build and deployment**, set Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**. Tap **Save**.
5. Wait 1 to 2 minutes. Your site appears at `https://YOUR-USERNAME.github.io/smartflow-ai/`.

## Update later
Open the repo on github.com, tap a file, tap the pencil icon, edit, tap **Commit changes**. The site refreshes in a minute or two. To replace a file, use Add file > Upload files with the same name.

## Test checklist
- WhatsApp buttons (hero, contact, footer) open chat with the pre-filled message.
- Email buttons open your mail app with subject and body filled in.
- Call Now dials +923273602005.
- Menu opens/closes on phone; every nav link scrolls to its section.
- FAQ items expand and collapse.
- No sideways scrolling at phone width; check in portrait and landscape.
- Speed: run pagespeed.web.dev on your live URL.

## Optional later
Add `sitemap.xml` and an Open Graph preview image once you have your final domain.
