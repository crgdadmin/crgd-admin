/**
 * Builds CRGD's five application forms in Google Forms.
 *
 * Run it once, signed in to the Google account that should own the forms
 * (ideally CRGD's own account, not a personal one):
 *
 *   1. Go to https://script.google.com and choose New project.
 *   2. Delete the sample code, paste this whole file in, and save.
 *   3. Optional: put team members' Gmail addresses in TEAM_EDITORS below,
 *      so they can edit the forms and see every application.
 *   4. Choose createApplicationForms in the function menu and press Run.
 *      Google asks for permission the first time: allow it.
 *
 * It creates a Drive folder, "CRGD Application Forms", holding:
 *   - the five forms;
 *   - one Google Sheet, "CRGD Applications", with a tab of responses for
 *     each form and a "Form links" tab listing every form's links.
 * Every new application is also emailed to the address set for its form.
 *
 * Paste each form's public link into the website's CMS, under
 * Application forms, or send the "Form links" tab to whoever maintains
 * the website. Running the script a second time stops with an error
 * rather than making duplicate forms.
 *
 * Google Forms cannot take file uploads unless applicants sign in with a
 * Google account, so the forms ask for a link to the CV and writing sample
 * instead. A file upload question can still be added later in the form
 * editor if wanted.
 */

const FOLDER_NAME = 'CRGD Application Forms';
const SHEET_NAME = 'CRGD Applications';
const TEAM_EDITORS = []; // For example: ['name@gmail.com', 'other@gmail.com']

const VERTICALS = [
  'Governance, Finance and Accountability',
  'Education and Human Development',
  'Health, Lifestyle and Sports',
  'Employment',
  'Federalism',
  'Art and Culture',
  'Mobility, Trade and Logistics',
  'Agriculture and Rural Development',
  'Strategic Affairs and Planning',
  'Science, Technology, and Innovation (STI)',
  'Energy and Maritime Affairs',
  'Society, Law and Policy',
  'Institutions and Social Justice',
  'Economy and Fintech',
  'Environment and Disaster Management',
  'Gender, State and Politics',
  'Urban Affairs',
  'Elections, Narratives and Perceptions',
  'Foreign Policy and Global Affairs',
  'Peace, Conflict and Security',
  'Tourism',
  'Demography and Migration',
];

const DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam',
  'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod', 'Outside Kerala',
];

const MODES = ['In person at Thiruvananthapuram', 'Remote', 'Hybrid'];
const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
const LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Kannada'];
const HEARD_FROM = ['CRGD website', 'LinkedIn', 'Instagram', 'X (Twitter)', 'WhatsApp', 'Friend or colleague', 'University or college', 'CRGD Policy Club', 'CRGD event'];
const LINK_HELP = 'Upload the file to Google Drive, Dropbox or OneDrive, set it so that anyone with the link can view it, and paste the link here.';
const PRIVACY = "as described in CRGD's privacy policy (crgd.in/privacy-policy)";

/* --------------------------- Shared sections ---------------------------- */

function personalDetails() {
  return {
    title: 'Personal details',
    items: [
      { type: 'text', title: 'Full name', required: true },
      { type: 'email', title: 'Email address', required: true },
      { type: 'text', title: 'Phone number (WhatsApp)', required: true },
      { type: 'date', title: 'Date of birth', required: true },
      { type: 'dropdown', title: 'Gender', options: GENDERS },
      { type: 'text', title: 'Current city or town', required: true },
      { type: 'text', title: 'District and State', required: true },
      { type: 'url', title: 'LinkedIn profile', help: 'Optional.' },
    ],
  };
}

function verticalsQuestion(title, required) {
  return { type: 'checks', title: title, help: 'Choose up to three.', options: VERTICALS, max: 3, required: required };
}

function finalDetails(declaration) {
  return {
    title: 'Final details',
    items: [
      { type: 'choice', title: 'How did you hear about this?', options: HEARD_FROM, other: true },
      { type: 'para', title: 'Anything else you would like us to know' },
      { type: 'declare', title: 'Declaration', option: declaration },
    ],
  };
}

const STANDARD_DECLARATION = `I confirm that the information I have given is true and complete, and I consent to CRGD storing and using it to assess my application, ${PRIVACY}.`;

/* ------------------------------ The forms ------------------------------- */

const FORMS = [
  {
    slug: 'research-team',
    title: 'CRGD Research Associate and Researcher Application',
    notify: 'careers@crgd.in',
    description:
      "Thank you for your interest in joining the research team of the Centre for Research on Governance and Development (CRGD): The Public Policy Bridge. Please complete every section carefully. Shortlisted applicants will be contacted by email for a writing task and an interview.",
    confirmation: 'Thank you for applying to CRGD. We have received your application and will contact shortlisted applicants by email. For questions, write to careers@crgd.in.',
    sections: [
      {
        title: 'Position',
        items: [
          { type: 'dropdown', title: 'Position applied for', options: ['Research Associate', 'Researcher', 'Senior Researcher'], required: true },
          { type: 'choice', title: 'Preferred commitment', options: ['Full time', 'Part time'], required: true },
          { type: 'choice', title: 'Preferred mode of work', options: MODES, required: true },
          { type: 'date', title: 'Earliest date you can join', required: true },
          { type: 'text', title: 'Notice period, if you are currently employed' },
        ],
      },
      personalDetails(),
      {
        title: 'Education',
        items: [
          { type: 'dropdown', title: 'Highest qualification', options: ["Bachelor's degree", "Master's degree", 'MPhil', 'PhD (ongoing)', 'PhD (completed)', 'Other'], required: true },
          { type: 'text', title: 'Subject or discipline', required: true },
          { type: 'text', title: 'University or institution', required: true },
          { type: 'number', title: 'Year of completion, or expected year', required: true },
          { type: 'para', title: 'Other qualifications, certifications or courses relevant to public policy' },
        ],
      },
      {
        title: 'Experience and skills',
        items: [
          { type: 'dropdown', title: 'Years of research or policy experience', options: ['Less than 1 year', '1 to 2 years', '3 to 5 years', '6 to 10 years', 'More than 10 years'], required: true },
          { type: 'text', title: 'Current or most recent employer and role' },
          { type: 'para', title: 'Your most relevant research or policy experience', help: '200 to 400 words.', required: true },
          { type: 'checks', title: 'Research methods you are comfortable with', options: ['Policy analysis', 'Quantitative analysis', 'Qualitative research and interviews', 'Field surveys', 'Literature reviews', 'Budget and fiscal analysis', 'Legal and legislative analysis', 'Data visualisation', 'GIS and mapping'], required: true, other: true },
          { type: 'checks', title: 'Software and tools you use', options: ['Excel', 'Stata', 'R', 'Python', 'SPSS', 'NVivo', 'QGIS or ArcGIS', 'Tableau or Power BI'], other: true },
          { type: 'checks', title: 'Languages you can read and write professionally', options: LANGUAGES, required: true, other: true },
          { type: 'para', title: 'Publications, reports or articles you have written, with links' },
        ],
      },
      {
        title: 'Research interests',
        items: [
          verticalsQuestion('CRGD research verticals you would like to work in', true),
          { type: 'para', title: 'Why do you want to work at CRGD, and what would you bring to the team?', help: '300 to 500 words.', required: true },
          { type: 'para', title: 'Describe one policy question in Kerala or India you would like to research, and how you would approach it', help: '200 to 400 words.', required: true },
        ],
      },
      {
        title: 'Documents',
        items: [
          { type: 'url', title: 'Link to your CV', help: LINK_HELP, required: true },
          { type: 'url', title: 'Link to one writing sample', help: 'Preferably a research paper, report or policy brief you wrote. ' + LINK_HELP, required: true },
        ],
      },
      {
        title: 'References',
        items: [
          { type: 'para', title: 'Referee 1: name, designation and organisation, email and phone', required: true },
          { type: 'para', title: 'Referee 2: name, designation and organisation, email and phone' },
        ],
      },
      finalDetails(STANDARD_DECLARATION),
    ],
  },

  {
    slug: 'fellowships',
    title: 'CRGD Fellowship Application',
    notify: 'careers@crgd.in',
    description:
      'CRGD fellowships support people who want to research a real policy question and see their work published. Please complete every section. Shortlisted applicants will be invited to an interview.',
    confirmation: 'Thank you for applying for a CRGD fellowship. We have received your application and will contact shortlisted applicants by email. For questions, write to careers@crgd.in.',
    sections: [
      {
        title: 'Fellowship',
        items: [
          { type: 'dropdown', title: 'Fellowship you are applying for', options: ['CRGD Public Policy Fellowship 2027', 'Young Researchers Fellowship (Part Time)', 'Journalism and Public Policy Fellowship'], required: true },
          { type: 'choice', title: 'Preferred mode', options: MODES, required: true },
          { type: 'dropdown', title: 'Hours per week you can commit', options: ['Less than 10', '10 to 20', '20 to 30', 'Full time'], required: true },
          { type: 'date', title: 'Earliest start date', required: true },
        ],
      },
      personalDetails(),
      {
        title: 'Education and current status',
        items: [
          { type: 'choice', title: 'Current status', options: ['Undergraduate student', 'Postgraduate student', 'PhD scholar', 'Working professional', 'Journalist or media professional', 'Between roles'], required: true },
          { type: 'dropdown', title: 'Highest qualification', options: ['Higher secondary', "Bachelor's degree", "Master's degree", 'MPhil', 'PhD (ongoing)', 'PhD (completed)', 'Other'], required: true },
          { type: 'text', title: 'Subject or discipline', required: true },
          { type: 'text', title: 'University, institution or employer', required: true },
          { type: 'number', title: 'Year of completion, or expected year' },
        ],
      },
      {
        title: 'Research proposal',
        items: [
          { type: 'dropdown', title: 'Research vertical your proposal fits best', options: VERTICALS, required: true },
          { type: 'text', title: 'Working title of your proposed research', required: true },
          { type: 'para', title: 'The policy question you want to answer, and why it matters now', help: '200 to 300 words.', required: true },
          { type: 'para', title: 'How you will answer it: data, sources, methods and any field work', help: '200 to 300 words.', required: true },
          { type: 'para', title: 'What you expect to produce by the end of the fellowship', help: 'For example a policy brief, report, article series or dataset.', required: true },
          { type: 'para', title: 'Who should act on your findings?', help: 'For example a department, local body, legislature or the public.' },
        ],
      },
      {
        title: 'About you',
        items: [
          { type: 'para', title: 'Why do you want a CRGD fellowship?', help: '250 to 400 words.', required: true },
          { type: 'para', title: 'Relevant research, writing, journalism or field experience', required: true },
          { type: 'para', title: 'Links to anything you have published' },
        ],
      },
      {
        title: 'Documents',
        items: [
          { type: 'url', title: 'Link to your CV', help: LINK_HELP, required: true },
          { type: 'url', title: 'Link to one writing sample', help: LINK_HELP, required: true },
          { type: 'url', title: 'Link to a detailed research proposal, if you have one', help: LINK_HELP },
        ],
      },
      {
        title: 'References',
        items: [
          { type: 'para', title: 'Referee 1, preferably an academic supervisor or editor: name, designation and organisation, email and phone', required: true },
          { type: 'para', title: 'Referee 2: name, designation and organisation, email and phone' },
        ],
      },
      finalDetails(`I confirm that the proposal and writing sample are my own work, that the information I have given is true and complete, and I consent to CRGD storing and using it to assess my application, ${PRIVACY}.`),
    ],
  },

  {
    slug: 'internships',
    title: 'CRGD Internship Application',
    notify: 'careers@crgd.in',
    description:
      'CRGD internships give students hands-on experience in research, writing and public engagement. Please complete every section. Shortlisted applicants will be contacted by email for a short task and a conversation.',
    confirmation: 'Thank you for applying for a CRGD internship. We have received your application and will contact shortlisted applicants by email. For questions, write to careers@crgd.in.',
    sections: [
      {
        title: 'Internship',
        items: [
          { type: 'dropdown', title: 'Internship you are applying for', options: ['Winter Research Internship 2026–27', 'Summer Research Internship 2027', 'Communications and Outreach Internship'], required: true },
          { type: 'choice', title: 'Preferred duration', options: ['4 weeks', '6 weeks', '8 weeks', '12 weeks'], required: true },
          { type: 'date', title: 'Preferred start date', required: true },
          { type: 'choice', title: 'Preferred mode', options: MODES, required: true },
          { type: 'dropdown', title: 'Hours per week you can commit', options: ['Less than 10', '10 to 20', '20 to 30', 'Full time'], required: true },
          { type: 'choice', title: 'Is this internship a requirement of your course?', options: ['Yes, I need a completion certificate or letter for my institution', 'No'], required: true },
        ],
      },
      personalDetails(),
      {
        title: 'Education',
        items: [
          { type: 'text', title: 'College or university', required: true },
          { type: 'text', title: 'Course and degree', help: 'For example BA Economics or LLB.', required: true },
          { type: 'dropdown', title: 'Current year of study', options: ['First year', 'Second year', 'Third year', 'Fourth year', 'Fifth year', 'Postgraduate first year', 'Postgraduate second year', 'Recently graduated'], required: true },
          { type: 'number', title: 'Expected year of graduation', required: true },
          { type: 'text', title: 'Name and email of a faculty member who can vouch for you' },
        ],
      },
      {
        title: 'Interests and skills',
        items: [
          verticalsQuestion('CRGD research verticals that interest you', true),
          { type: 'checks', title: 'Skills you can offer', options: ['Research and literature reviews', 'Writing and editing', 'Data collection and surveys', 'Data analysis (Excel, R, Python or similar)', 'Graphic design', 'Social media management', 'Photography or video editing', 'Event organisation', 'Translation', 'Website and digital tools'], required: true, other: true },
          { type: 'checks', title: 'Languages you can read and write well', options: LANGUAGES, required: true, other: true },
          { type: 'para', title: 'Previous internships, projects, clubs or volunteering' },
        ],
      },
      {
        title: 'Statement',
        items: [
          { type: 'para', title: 'Why do you want to intern at CRGD, and what do you hope to learn?', help: '200 to 400 words.', required: true },
          { type: 'para', title: 'Describe a policy issue you care about and what you think should be done about it', help: '150 to 300 words.', required: true },
        ],
      },
      {
        title: 'Documents',
        items: [
          { type: 'url', title: 'Link to your CV or resume', help: LINK_HELP, required: true },
          { type: 'url', title: 'Link to a writing sample such as an essay, article or assignment', help: 'Recommended for research internships. ' + LINK_HELP },
          { type: 'url', title: 'Link to a portfolio, social media page or design work', help: 'For communications applicants.' },
        ],
      },
      finalDetails(STANDARD_DECLARATION),
    ],
  },

  {
    slug: 'coordinators',
    title: 'CRGD Co-ordinator Program Application',
    notify: 'careers@crgd.in',
    description:
      "CRGD co-ordinators represent CRGD on their campus or in their district, build a community of young people interested in public policy, and help organise CRGD's events and programmes. Please complete every section. Shortlisted applicants will be invited for a conversation.",
    confirmation: 'Thank you for applying to the CRGD Co-ordinator Program. We have received your application and will contact shortlisted applicants by email. For questions, write to careers@crgd.in.',
    sections: [
      {
        title: 'Programme',
        items: [
          { type: 'choice', title: 'Programme you are applying for', options: ['Campus Co-ordinator Program', 'District Co-ordinator Program'], required: true },
          { type: 'text', title: 'College or university you will represent', help: 'For the Campus Co-ordinator Program.' },
          { type: 'dropdown', title: 'District you will represent', options: DISTRICTS, required: true },
          { type: 'text', title: 'If outside Kerala, which city and state?' },
          { type: 'dropdown', title: 'Hours per month you can commit', options: ['Less than 10', '10 to 20', '20 to 40', 'More than 40'], required: true },
        ],
      },
      {
        title: 'Personal details',
        items: personalDetails().items.concat([{ type: 'text', title: 'Instagram or other social media handle', help: 'Optional.' }]),
      },
      {
        title: 'Education or work',
        items: [
          { type: 'choice', title: 'Current status', options: ['Undergraduate student', 'Postgraduate student', 'PhD scholar', 'Working professional'], required: true, other: true },
          { type: 'text', title: 'Institution or organisation', required: true },
          { type: 'text', title: 'Course and year of study, or current role', required: true },
        ],
      },
      {
        title: 'Leadership and outreach',
        items: [
          { type: 'para', title: 'Leadership roles you have held', help: 'Clubs, student unions, NSS, NCC, societies or community groups.', required: true },
          { type: 'para', title: 'Events you have organised or helped organise, with approximate audience size' },
          { type: 'dropdown', title: 'Roughly how many students or young people could you reach through your networks?', options: ['Fewer than 50', '50 to 200', '200 to 500', 'More than 500'] },
          verticalsQuestion('CRGD research verticals that interest you most', false),
        ],
      },
      {
        title: 'Your plan',
        items: [
          { type: 'para', title: 'Why do you want to be a CRGD co-ordinator?', help: '200 to 400 words.', required: true },
          { type: 'para', title: 'What would you do in your first three months to build a CRGD community where you are?', help: '200 to 400 words.', required: true },
          { type: 'para', title: 'Suggest one event, discussion or campaign you would like to organise with CRGD' },
        ],
      },
      {
        title: 'Documents',
        items: [{ type: 'url', title: 'Link to your CV or resume', help: LINK_HELP, required: true }],
      },
      finalDetails(STANDARD_DECLARATION),
    ],
  },

  {
    slug: 'policy-clubs',
    title: 'CRGD Policy Club Registration',
    notify: 'connect@crgd.in',
    description:
      "Start a CRGD Policy Club at your institution: a student club that discusses, debates and researches public policy with CRGD's support, and takes part in events such as the annual inter-club mock assembly. Fill in this form with the student lead and a faculty adviser. CRGD will contact you to confirm the club and plan its first session.",
    confirmation: 'Thank you for registering a CRGD Policy Club. We will be in touch by email to confirm the club and plan its first session. For questions, write to connect@crgd.in.',
    sections: [
      {
        title: 'Institution',
        items: [
          { type: 'text', title: 'Name of the institution', required: true },
          { type: 'choice', title: 'Type of institution', options: ['College', 'University department', 'School (higher secondary)'], required: true, other: true },
          { type: 'para', title: 'Full address', required: true },
          { type: 'dropdown', title: 'District', options: DISTRICTS, required: true },
          { type: 'url', title: 'Institution website' },
        ],
      },
      {
        title: 'Student lead',
        items: [
          { type: 'text', title: 'Student lead: full name', required: true },
          { type: 'email', title: 'Student lead: email address', required: true },
          { type: 'text', title: 'Student lead: phone number (WhatsApp)', required: true },
          { type: 'text', title: 'Student lead: course and year of study', required: true },
        ],
      },
      {
        title: 'Faculty adviser',
        items: [
          { type: 'text', title: 'Faculty adviser: full name', required: true },
          { type: 'text', title: 'Faculty adviser: designation and department', required: true },
          { type: 'email', title: 'Faculty adviser: email address', required: true },
          { type: 'text', title: 'Faculty adviser: phone number', required: true },
        ],
      },
      {
        title: 'The club',
        items: [
          { type: 'text', title: 'Proposed name of the club', help: 'If left blank: CRGD Policy Club followed by the name of the institution.' },
          { type: 'number', title: 'Number of founding student members', required: true },
          { type: 'para', title: 'Founding members: names, courses and years' },
          { type: 'choice', title: 'Does the institution already have a debate, Model UN or policy society?', options: ['Yes', 'No'], required: true },
          { type: 'para', title: 'If yes, its name and how this club would work with it' },
          verticalsQuestion('Policy areas the club wants to focus on', true),
          { type: 'checks', title: 'Activities the club plans to hold', options: ['Policy discussions', 'Debates', 'Guest lectures', 'Research projects', 'Mock assemblies or parliaments', 'Field visits', "Writing for CRGD's Young Thoughts series", 'Workshops'], required: true, other: true },
          { type: 'dropdown', title: 'How often the club plans to meet', options: ['Weekly', 'Fortnightly', 'Monthly'], required: true },
          { type: 'para', title: 'What do you hope the club will achieve in its first year?', help: '150 to 300 words.', required: true },
        ],
      },
      {
        title: 'Approval',
        items: [
          { type: 'choice', title: 'Has the head of the institution or department approved the club?', options: ['Yes', 'Approval in progress', 'Not yet'], required: true },
          { type: 'url', title: 'Link to a letter of approval or support from the principal or head of department', help: 'Optional. ' + LINK_HELP },
        ],
      },
      finalDetails(`I confirm that the information I have given is true, that the faculty adviser named above has agreed to be listed, and I consent to CRGD storing and using it to set up and support the club, ${PRIVACY}.`),
    ],
  },
];

/* ------------------------------- Building ------------------------------- */

function createApplicationForms() {
  if (DriveApp.getFoldersByName(FOLDER_NAME).hasNext()) {
    throw new Error(`A folder called "${FOLDER_NAME}" already exists in your Drive, so the forms were not created again. Delete or rename it first if you really want a fresh set.`);
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  const sheet = SpreadsheetApp.create(SHEET_NAME);
  DriveApp.getFileById(sheet.getId()).moveTo(folder);
  // Held now: Google adds each form's responses tab in front of it.
  const linksTab = sheet.getSheets()[0];

  const links = [['Form', 'Website address (/apply/...)', 'Public link: paste into the website CMS', 'Edit link']];
  FORMS.forEach((spec) => {
    const form = buildForm(spec);
    DriveApp.getFileById(form.getId()).moveTo(folder);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
    PropertiesService.getScriptProperties().setProperty(`notify_${form.getId()}`, spec.notify);
    ScriptApp.newTrigger('emailNewApplication').forForm(form).onFormSubmit().create();
    links.push([spec.title, spec.slug, form.getPublishedUrl(), form.getEditUrl()]);
    Logger.log(`${spec.title}\n  public: ${form.getPublishedUrl()}\n  edit:   ${form.getEditUrl()}`);
  });

  nameResponseTabs(sheet);
  linksTab.setName('Form links');
  linksTab.getRange(1, 1, links.length, links[0].length).setValues(links);
  linksTab.getRange(1, 1, 1, links[0].length).setFontWeight('bold');
  linksTab.autoResizeColumns(1, links[0].length);
  sheet.setActiveSheet(linksTab);
  sheet.moveActiveSheet(1);

  if (TEAM_EDITORS.length) folder.addEditors(TEAM_EDITORS);
  Logger.log(`Done. Everything is in the Drive folder "${FOLDER_NAME}": ${folder.getUrl()}`);
}

function buildForm(spec) {
  const form = FormApp.create(spec.title);
  form
    .setDescription(spec.description)
    .setConfirmationMessage(spec.confirmation)
    .setProgressBar(true)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(false);

  spec.sections.forEach((section, i) => {
    // Each section is its own page, so the form is never one long scroll.
    if (i > 0) form.addPageBreakItem().setTitle(section.title);
    else form.addSectionHeaderItem().setTitle(section.title);
    section.items.forEach((item) => addItem(form, item));
  });
  return form;
}

function addItem(form, item) {
  let question;
  switch (item.type) {
    case 'text':
      question = form.addTextItem();
      break;
    case 'email':
      question = form.addTextItem().setValidation(FormApp.createTextValidation().setHelpText('Please enter a valid email address.').requireTextIsEmail().build());
      break;
    case 'url':
      question = form.addTextItem().setValidation(FormApp.createTextValidation().setHelpText('Please paste a full link, starting with https://').requireTextIsUrl().build());
      break;
    case 'number':
      question = form.addTextItem().setValidation(FormApp.createTextValidation().setHelpText('Please enter a number.').requireNumber().build());
      break;
    case 'para':
      question = form.addParagraphTextItem();
      break;
    case 'date':
      question = form.addDateItem();
      break;
    case 'choice':
      question = form.addMultipleChoiceItem().setChoiceValues(item.options);
      if (item.other) question.showOtherOption(true);
      break;
    case 'dropdown':
      question = form.addListItem().setChoiceValues(item.options);
      break;
    case 'checks':
      question = form.addCheckboxItem().setChoiceValues(item.options);
      if (item.other) question.showOtherOption(true);
      if (item.max) question.setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(item.max).build());
      break;
    case 'declare':
      question = form.addCheckboxItem().setChoiceValues([item.option]);
      item.required = true;
      break;
    default:
      throw new Error(`Unknown question type: ${item.type}`);
  }
  question.setTitle(item.title).setRequired(Boolean(item.required));
  if (item.help) question.setHelpText(item.help);
}

/** Names each responses tab after its form, so the sheet is easy to find your way around. */
function nameResponseTabs(sheet) {
  SpreadsheetApp.flush();
  Utilities.sleep(3000);
  sheet.getSheets().forEach((tab) => {
    const url = tab.getFormUrl();
    if (!url) return;
    try {
      const title = FormApp.openByUrl(url).getTitle().replace(/^CRGD /, '').slice(0, 90);
      tab.setName(title);
    } catch (error) {
      Logger.log(`Could not rename a responses tab: ${error}`);
    }
  });
}

/* ---------------------------- Notifications ----------------------------- */

/** Runs on every submission and emails the answers to the address set for that form. */
function emailNewApplication(e) {
  const form = e.source;
  const to = PropertiesService.getScriptProperties().getProperty(`notify_${form.getId()}`);
  if (!to) return;
  const answers = e.response.getItemResponses();
  let name = '';
  let replyTo = '';
  const lines = answers.map((answer) => {
    const title = answer.getItem().getTitle();
    const value = [].concat(answer.getResponse()).join(', ');
    if (!name && /full name/i.test(title)) name = value;
    if (!replyTo && /email address/i.test(title)) replyTo = value;
    return `${title}\n${value}\n`;
  });
  const options = {
    to: to,
    subject: `New application: ${form.getTitle()}${name ? ` from ${name}` : ''}`,
    body: `A new response to "${form.getTitle()}".\n\n${lines.join('\n')}\nAll responses: ${form.getDestinationId() ? SpreadsheetApp.openById(form.getDestinationId()).getUrl() : form.getEditUrl()}`,
  };
  if (replyTo) options.replyTo = replyTo;
  MailApp.sendEmail(options);
}
