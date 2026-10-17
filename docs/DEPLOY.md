# Putting the site live

The site is a static website built by GitHub Actions and served by GitHub Pages, free of charge.

## 1. How publishing works

The site is live at **https://irijournal.github.io/Website-for-Amal/**.

1. Every save in Pages CMS (and every push to `main`) runs the **Build and deploy the website** workflow in the Actions tab.
2. The workflow checks the content files, builds the site, checks every internal link, and publishes the result to the `gh-pages` branch.
3. GitHub Pages serves the `gh-pages` branch (Settings > Pages > Build and deployment > **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`). A second run called **pages build and deployment** appears in the Actions tab each time; when it turns green the change is online.

If a build fails (for example a required field was left empty), the live site stays on the previous version and the Actions tab shows a red mark with the reason.

The site also rebuilds every night at midnight India time, so that events move from Upcoming to Past on their own.

Do not edit the `gh-pages` branch by hand: it is replaced on every deploy.

## 2. Connect Pages CMS

1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with GitHub.
2. Install the Pages CMS GitHub app on this repository when asked.
3. Open the repository. The CMS reads `.pages.yml` and shows the editing sidebar.

See `CMS-GUIDE.md` for day to day use.

## 3. Switch on the contact form

1. Go to [web3forms.com](https://web3forms.com), enter the email address that should receive messages, and copy the access key they send.
2. In the CMS, paste it into Site settings > **Web3Forms access key**. Save.

The contact page now shows a full form. Without a key it shows an email button instead, so nothing is ever broken.

## 4. Email updates (newsletter)

Choose one:

- **A newsletter service** (Mailchimp, Brevo, Buttondown, Zoho Campaigns and others). Create a sign up form there, copy the form's *action* address, and paste it into Site settings > **Newsletter form address**. Set **Newsletter email field name** to the name that service uses (often `EMAIL` for Mailchimp, `email` for most others).
- **No service yet.** With only the Web3Forms key set, each sign up is emailed to the office.

## 5. A custom domain

1. Buy the domain from any registrar.
2. In the repository, create the file `public/CNAME` containing only the domain, for example `www.crgd.org` (in Pages CMS or on GitHub: Add file > Create new file).
3. In **Settings > Pages > Custom domain**, enter the same domain and save. GitHub shows the DNS records to add.
4. At the registrar, add the records GitHub lists: a `CNAME` record for `www` pointing to `irijournal.github.io`, and the four `A` records for the bare domain.
5. When the DNS check passes, tick **Enforce HTTPS**.
6. Update Site settings > **Website address** and the email addresses.

The next build notices the `CNAME` file and switches every link, the sitemap and the sharing previews to the new domain automatically.

## Local development

```bash
npm install
npm run dev
```

Requires Node 22.22 or newer.
