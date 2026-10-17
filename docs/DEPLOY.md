# Putting the site live

The site is a static website built by GitHub Actions and served by GitHub Pages, free of charge.

## 1. Switch on GitHub Pages

1. In the repository on GitHub, open **Settings > Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and run **Build and deploy the website** (or push any change). When it finishes, the site is live at `https://irijournal.github.io/Website-for-Amal/`.

The workflow reads the address from GitHub Pages, so links work both at that address and on a custom domain without any change to the code.

The site also rebuilds every night at midnight India time, so that events move from Upcoming to Past on their own.

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
2. In the repository, **Settings > Pages > Custom domain**, enter it (for example `www.crgd.org`) and save. GitHub shows the DNS records to add.
3. At the registrar, add the records GitHub lists: a `CNAME` record for `www` pointing to `irijournal.github.io`, and the four `A` records for the bare domain.
4. When the check passes, tick **Enforce HTTPS**.
5. Update Site settings > **Website address** and the email addresses.

The next build automatically uses the new domain for links, the sitemap and sharing previews.

## Local development

```bash
npm install
npm run dev
```

Requires Node 22.22 or newer.
