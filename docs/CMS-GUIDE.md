# Running the website with Pages CMS

Pages CMS is a free editor that works directly on this GitHub repository. Every time you press **Save**, it records the change on GitHub and the website rebuilds itself. The new version is live within about three minutes.

## Signing in

1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with the GitHub account that has access to the repository.
2. Choose the repository and the `main` branch.
3. The left sidebar lists everything you can edit.

To give a colleague access, add them as a collaborator on the GitHub repository (Settings > Collaborators), or invite them by email from Pages CMS.

## What is in the sidebar

| Sidebar entry | What it controls |
| --- | --- |
| Site settings | Name, logo, tagline, vision and mission lines, contact details, social links, forms, bank details, fonts, placeholder labels |
| Home page | Every heading, text and on/off switch on the home page |
| Main menu | The eight menu headings, their drop down columns and links. The footer uses the same list |
| Section introductions and categories | The banner text and image of each section, and the names and descriptions of categories (publication types, people groups and so on) |
| Pages | Story, vision, mission, founder's message, policies, contact, support and other written pages |
| People | Every profile |
| Research verticals | The eighteen verticals |
| Publications | All sixteen publication types |
| Learning, Programs, Impact, Events, Media, Photographs | One entry per item |
| Annual reports, Job openings, Locations, Latest updates | One entry per item |
| Media (top of sidebar) | All uploaded images and files |

## Uploading the logo

Site settings > **Logo** > choose or upload an image > Save. A PNG or SVG with a transparent background works best. Upload a white version in **Logo for dark backgrounds** for the footer and the menu bar. The current logo already shows CRGD, so *Show the short name beside the logo* is switched off and only the full name and tagline appear beside it. If a new logo contains the whole name, switch off *Show the name and tagline beside the logo* too. The logo files, including the full logo with the name lines, are in the media library under `uploads/logo`.

## Images everywhere

Every person, publication, event, program, course, impact story, media item, album, report and page has an image field. Until an image is uploaded, the site shows a placeholder in the CRGD blues; people show their initials.

Good sizes:

- People: portrait, 800 by 1000 pixels
- Publications, events and other covers: landscape, 1600 by 900 pixels
- Photograph albums: any size; the site resizes them on screen

Always fill in the **image description** field. It is read aloud to visitors who use screen readers and helps search engines.

## Adding a publication

1. Publications > **Add an entry**.
2. **Web address**: short, lowercase, words joined by hyphens, for example `kerala-budget-2027-reading`. It becomes part of the link and should never change after publishing.
3. Title, type, date, summary.
4. **Authors**: type the web address of each author from People (for example `scholar-one`). The byline then links to their profile, and the publication appears on it. A plain name (for example a guest author) is shown as text.
5. Choose the research verticals. The publication then appears on those verticals' pages.
6. Upload a cover image, and a PDF if there is one.
7. For podcasts and videos, paste the YouTube, Vimeo, Spotify or SoundCloud link into **Audio or video link**.
8. Write the text in **Full text**. Headings (Heading 2) become the contents list beside long pieces.
9. Save.

## Adding a person

People > Add an entry. The **web address** (for example `anjali-menon`) is what you type to credit them on publications, events and courses. Choose every group they belong to under **Listed under**: a person can be both a scholar and on the governing board. Use **Order** to control who appears first (lower numbers first).

## Adding an event

Events > Add an entry. Enter the date and, for timed events, start and end times on the 24 hour clock (for example `17:00`). The site shows the event under Upcoming until the day after it ends, then moves it to Past events automatically. After the event, add the recording link, the report PDF and the photograph album name, and they appear on the same page.

## Latest Updates strip

Latest updates > Add an entry. Give it a short headline and, in **Link**, the page it should lead to (for example `/programs/fellowships/public-policy-fellowship-2027`). Tick **Show in the Latest Updates strip**. Pinned updates stay at the top of the updates page.

## Contact details inside page text

In any page's content you can write `{{email}}`, `{{phone}}`, `{{careersEmail}}`, `{{mediaEmail}}`, `{{submissionsEmail}}` or `{{address}}`. The site fills in the current value from Site settings, so when an address changes you only change it once.

## Categories

Section introductions and categories holds the names and descriptions of publication types, learning categories, program categories, impact categories, media categories and people groups. You can rename them and rewrite their descriptions freely. Do not change the **web address** of an existing category, because entries refer to it.

## Placeholders

Sample entries have the **Placeholder** box ticked. While Site settings > *Show placeholder labels* is on, these entries carry a yellow label and a note. When you replace an entry with real content, untick its Placeholder box. Before launch, switch the labels off altogether.

## If something goes wrong

Every save is a commit on GitHub, so nothing is ever lost. If a save breaks the build (for example a required field left empty), the live site stays on the previous version. The repository's **Actions** tab shows a red mark and the reason. Fix the entry and save again.
