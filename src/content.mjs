// Single source of truth for site copy.
// Source: Worksmith Capabilities Portfolio, 2026 edition.
// CA Workflow Automation is intentionally excluded from Vertical II; services are renumbered 01–08.

export const site = {
  name: 'Worksmith',
  legal: 'Worksmith Solutions Private Limited',
  domain: 'https://worksmith.tech',
  email: 'contact@worksmith.tech',
  location: 'Hyderabad, Telangana, India',
  locationShort: 'Hyderabad, India · Working globally',
  founders: [],
  disclaimer:
    'This website describes services and method. It is not an offer, and it contains no representation as to results, which depend on the findings of a diagnostic conducted on the client’s own data.',
};

export const principles = [
  { n: '01', title: 'Evidence before build', body: 'Every recommendation traces to records in your own systems. If we cannot show you the underlying rows, we do not make the claim.' },
  { n: '02', title: 'You own what we build', body: 'Code, data, and infrastructure are yours. No proprietary runtime, no per-seat rent on your own operations, no exit penalty.' },
  { n: '03', title: 'Measured, not asserted', body: 'A baseline is agreed in writing before the work starts, so the result at the end is a measurement rather than a story.' },
];

export const verticals = [
  {
    id: 'business-health-check',
    roman: 'I',
    verb: 'Find it',
    stage: 2,
    homeLede: 'Establish what is leaking and what it costs, in your own numbers — first as a time-boxed diagnostic, then as a detection layer that keeps doing it after we leave.',
    title: 'Business Health Check',
    lede: 'Find the loss and put a number on it — first as a time-boxed diagnostic, then as a detection layer that keeps doing it after we leave.',
    summary: 'Establish what is leaking and what it costs, in your own numbers — once as a diagnostic, then continuously as a detection layer.',
    order: 'Always first',
    orderHead: 'Always first.',
    orderBody: 'Nothing else is priced honestly until the loss is measured. A diagnostic can also conclude that no build is warranted, and that is a valid result.',
    services: ['business-health-check', 'operational-intelligence-systems'],
  },
  {
    id: 'workflow-automation',
    roman: 'II',
    verb: 'Carry it',
    stage: 3,
    homeLede: 'Take the repetitive, cross-system work off people and put it into systems and agents that can be audited, corrected and held to a deadline.',
    title: 'Workflow Automation',
    lede: 'Take the repetitive, cross-system work off people and put it into systems and agents that can be audited, corrected and held to a deadline — built for any operation.',
    summary: 'Take the repetitive, cross-system work off people and put it into systems and agents that can be audited — for any operation.',
    order: 'Then',
    orderHead: 'Last — on a process that is understood and a record layer that is trustworthy.',
    orderBody: 'Automation applied to a process that is understood and a record layer that is trustworthy. Applied any earlier, it makes an existing problem faster.',
    services: ['business-process-automation', 'ai-agent-development', 'whatsapp-communication-automation'],
  },
  {
    id: 'digital-foundation',
    roman: 'III',
    verb: 'Ground it',
    stage: 4,
    homeLede: 'Build the record layer — the systems that capture the data everything above depends on being true. Nothing in the other two verticals is better than this one.',
    title: 'Digital Foundation',
    lede: 'Build the record layer — the systems that capture the data everything above them depends on being true. Nothing in the other two verticals is better than this one.',
    summary: 'Build the record layer — the systems that capture the data everything above depends on being true.',
    order: 'Then, if needed',
    orderHead: 'Then, if needed — before anything is automated on top of it.',
    orderBody: 'If the diagnostic finds that the underlying records are unreliable or do not exist, the foundation is fixed before anything is automated on top of it.',
    services: ['custom-software-crm-portals', 'mobile-applications', 'growth-analytics-infrastructure'],
  },
];

// Recommended engagement order (differs from numbering on purpose).
export const orderSequence = ['business-health-check', 'digital-foundation', 'workflow-automation'];

export const honestVersion =
  'A business that buys Vertical II without Vertical III in place is paying us to automate against data that is not being captured reliably. We will tell you that at the diagnostic stage rather than at the go-live.';

/*
  Service block types:
  - bullets:  { type:'bullets', label, cols, items:[{k, v}] }   (k optional bold lead)
  - table:    { type:'table', label, rows:[{k, v}] }
  - steps:    { type:'steps', label, items:[{k, v}] }
  - list:     { type:'list', label, items:[string] }
*/
export const services = [
  {
    id: 'business-health-check',
    caption: 'Vertical I — eight loss domains, each finding put on record.',
    n: '01',
    vertical: 'business-health-check',
    title: 'Business Health Check',
    short: 'A structured examination across eight loss domains, producing an evidenced findings register.',
    lede: 'A structured, time-boxed examination of where money and time leave the business — between systems, between departments, and in the gaps nobody owns.',
    blocks: [
      {
        type: 'bullets', label: 'The eight domains we examine', cols: 2,
        items: [
          { k: 'Revenue & billing accuracy', v: 'work delivered but never invoiced, rate-card drift, missed escalations.' },
          { k: 'Procurement & vendor spend', v: 'price variance for the same item, duplicate vendors, off-contract buying.' },
          { k: 'Inventory & working capital', v: 'stock that is financed but not moving, write-off patterns, shrinkage signals.' },
          { k: 'Receivables & collection cycle', v: 'ageing concentration, dispute-driven delay, follow-up that stopped.' },
          { k: 'Compliance & tax exposure', v: 'credits not claimed, credits at risk, filing and documentation gaps.' },
          { k: 'Manual effort & duplication', v: 'the same figure keyed into three places by three people.' },
          { k: 'Data integrity across systems', v: 'where two systems disagree about the same fact, and which one is believed.' },
          { k: 'Decision latency', v: 'the interval between an event happening and a person being able to act on it.' },
        ],
      },
      {
        type: 'table', label: 'What you receive',
        rows: [
          { k: 'Findings register', v: 'Every finding stated as an amount, with the records it was derived from, the method used, and a confidence rating we are willing to defend.' },
          { k: 'Root cause', v: 'Whether the cause is process, system, data, or incentive — because the fix differs completely and three of those four are not software problems.' },
          { k: 'Ranked remediation', v: 'Each finding scored on value, effort and certainty, so the sequencing decision is yours and is made on evidence.' },
          { k: 'Agreed baseline', v: 'The measurement basis for anything built afterwards, fixed in writing before build starts rather than reconstructed at the end.' },
        ],
      },
    ],
    gain: [
      'You find out what is actually wrong, in your own numbers, before committing capital to a system. The register is useful whether or not you engage us further — it is your document, derived from your data, and it survives the relationship.',
      'It also changes your position with every other vendor: a quote you can map to a specific evidenced loss is a decision; one you cannot is a gamble with a purchase order attached.',
    ],
    bestFit: 'you suspect there is leakage but cannot name it, when two systems disagree and nobody can say which is right, or when you have a proposal in hand and no way to judge whether it solves anything.',
  },
  {
    id: 'operational-intelligence-systems',
    caption: 'Vertical I — the same gaps, raised as they form.',
    n: '02',
    vertical: 'business-health-check',
    title: 'Operational Intelligence Systems',
    short: 'Continuous monitoring that raises evidenced, owned, deadlined alerts as problems form.',
    lede: 'The health check made continuous — systems that watch operations and raise an evidenced, owned, deadlined alert when something is wrong, instead of showing it to you in next month’s report.',
    blocks: [
      {
        type: 'steps', label: 'The method',
        items: [
          { k: 'Connect', v: 'Pull from ERP, accounting, spreadsheets, email, WhatsApp and field apps — including the sources that are not databases, because that is where half the truth lives.' },
          { k: 'Graph', v: 'Relate the entities to each other: vendor, item, site, invoice, contract, person. One connected model rather than eight isolated tables.' },
          { k: 'Detect', v: 'Rules for what you already know is wrong; anomaly models for the patterns nobody thought to write a rule for.' },
          { k: 'Evidence', v: 'Every alert arrives carrying the underlying records, so the first response is a decision rather than an investigation.' },
          { k: 'Escalate', v: 'Routed to a named owner with a deadline, escalated on silence, and closed with a recorded resolution.' },
        ],
      },
      {
        type: 'list', label: 'What it catches that reports do not',
        items: [
          'The same item bought at three different prices across two sites in the same week.',
          'A vendor whose filing behaviour changed two months before the credit becomes a problem.',
          'A site whose consumption pattern quietly diverged from every comparable site.',
          'An approval that was granted by someone who should not have had that authority.',
          'A receivable that stopped being chased because the person chasing it changed roles.',
        ],
      },
    ],
    gain: [
      'A report tells you what happened, to a business that has already moved on. This tells you what is happening, who has to act, and by when — which converts a monthly post-mortem into an operating rhythm.',
      'Because the entities are related in one graph rather than sitting in separate systems, it answers questions nobody designed it to answer. That is the compounding part: the second year of questions is more valuable than the first, and it costs nothing extra to ask them.',
    ],
    bestFit: 'operations span multiple sites, entities or systems, when the same fact is recorded in more than one place, or when problems are reliably found — but always one cycle too late.',
  },
  {
    id: 'business-process-automation',
    focus: 0,
    caption: 'Vertical II — ERP: order to cash, carried end to end.',
    n: '03',
    vertical: 'workflow-automation',
    title: 'Business Process Automation',
    short: 'The cross-system processes that run any operation daily — order to cash, procure to pay, approvals, document handling.',
    lede: 'The repetitive, cross-system processes that run an operation every day — mapped, trimmed, and handed to software that does not forget a step or wait to be reminded.',
    blocks: [
      {
        type: 'bullets', label: 'Processes we automate', cols: 2,
        items: [
          { k: 'Order to cash', v: 'quote, order, dispatch, invoice, collection, and the handoffs that happen by email today.' },
          { k: 'Procure to pay', v: 'requisition, approval, PO, goods receipt, three-way match, payment release.' },
          { k: 'Inventory & dispatch', v: 'stock movement, reorder triggers, delivery and proof of delivery.' },
          { k: 'Approvals & exception routing', v: 'anything that sits in an inbox until someone happens to look.' },
          { k: 'Document handling', v: 'invoices, POs and statements read, validated against the source record, and posted.' },
          { k: 'People workflows', v: 'onboarding, attendance exceptions, reimbursements, leave and access requests.' },
          { k: 'Compliance cycles', v: 'recurring filings, licence and contract renewals, statutory registers.' },
          { k: 'Cross-system sync', v: 'keeping two systems that disagree in agreement, with a written rule for which one wins.' },
        ],
      },
      {
        type: 'table', label: 'How we do it',
        rows: [
          { k: 'Map the real process', v: 'Including the informal steps — the spreadsheet someone keeps, the call that has to happen before the system will accept the entry.' },
          { k: 'Eliminate, then automate', v: 'Steps that exist only because an old system demanded them are removed, not encoded. Automating a redundant step is how it becomes permanent.' },
          { k: 'Rules first, AI where needed', v: 'Deterministic logic wherever there is a right answer; models only where the input is unstructured or the judgment cannot be written as a rule.' },
          { k: 'Exceptions get an owner', v: 'Every failure path routes to a named person with a deadline — logged and reversible — rather than stalling silently until month end.' },
        ],
      },
    ],
    gain: [
      'The process stops depending on memory and attendance. It runs the same way on a Monday as on the last day of the quarter, and the same way whether or not the person who normally runs it is in.',
      'Two things also become measurable that rarely are: <strong>cycle time</strong> end to end, and <strong>touch count</strong> — how many people handle a transaction on the way. Both are levers once you can see them.',
    ],
    bestFit: 'the same information is re-entered into more than one system, when work waits in inboxes to be noticed, or when a process only runs correctly if a particular person is present.',
  },
  {
    id: 'ai-agent-development',
    focus: 1,
    caption: 'Vertical II — Ledger: agents post inside the gates you set.',
    n: '04',
    vertical: 'workflow-automation',
    title: 'AI Agent Development',
    short: 'Agents that carry out multi-step work end to end, with guardrails and approval gates.',
    lede: 'Software that carries out multi-step operational work end to end — reading, deciding, acting in your systems, and handing back to a person when it should.',
    blocks: [
      {
        type: 'table', label: 'How we build them responsibly',
        rows: [
          { k: 'Narrow scope', v: 'An agent owns one workflow with defined inputs and a defined finish line. General-purpose agents pointed at a whole business fail in ways that are expensive and hard to trace.' },
          { k: 'Deterministic core', v: 'Calculations, postings and compliance logic run as code. The model is used for interpretation and judgment — the parts code genuinely cannot express.' },
          { k: 'Guardrails and gates', v: 'Value thresholds, approval steps and blocked-action lists are configured by you, enforced outside the model, and cannot be talked around.' },
          { k: 'Confidence handoff', v: 'Below an agreed confidence level the agent stops and asks. A system that escalates is safe; a system that guesses confidently is a liability.' },
          { k: 'Full audit log', v: 'Every action recorded with its inputs, its reasoning and its result — reviewable, and reversible where the underlying system allows it.' },
        ],
      },
      {
        type: 'bullets', label: 'Typical deployments', cols: 1,
        items: [
          { k: 'Document intake', v: 'invoices, POs, delivery notes and bank advices read, validated against the source record, and posted or queued.' },
          { k: 'Exception handling', v: 'the cases that fall out of an automated process because they do not fit the expected format.' },
          { k: 'Follow-up loops', v: 'chasing a missing document or an unconfirmed delivery until it arrives or a person takes it over.' },
          { k: 'Monitoring and triage', v: 'watching a queue continuously and deciding what deserves a human’s attention today.' },
        ],
      },
    ],
    gain: [
      'Work continues when nobody is available to do it, and the messy cases stop being dropped into a pile. A rule engine cannot express “this invoice looks wrong” — it can only check the fields someone anticipated. Agents handle the cases in between, which in most operations is where the cost sits.',
      'The practical effect is that volume growth stops translating directly into headcount growth, and your experienced people spend their day on the exceptions rather than on the throughput.',
    ],
    bestFit: 'the work is repetitive but needs judgment, volume is high enough that consistency has become a problem, and the cost of a silent failure is high enough to justify guardrails.',
  },
  {
    id: 'whatsapp-communication-automation',
    focus: 3,
    caption: 'Vertical II — WhatsApp: follow-up that does not stop at silence.',
    n: '05',
    vertical: 'workflow-automation',
    title: 'WhatsApp & Communication Automation',
    short: 'Structured, logged, consent-handled follow-up on the channel people actually answer.',
    lede: 'Structured follow-up on the channel your customers and vendors actually answer — logged, consented, and connected to your records rather than living in someone’s phone.',
    blocks: [
      {
        type: 'bullets', label: 'What we build', cols: 1,
        items: [
          { k: 'WhatsApp Business API flows', v: 'for collections, renewals, document collection, delivery confirmation and service reminders.' },
          { k: 'Two-way capture', v: 'replies and attachments parsed and filed against the correct record automatically, so a reply becomes data rather than a notification someone has to act on.' },
          { k: 'Scheduled sequences', v: 'that escalate on silence instead of stopping at the first unanswered message, with a human handoff point defined in advance.' },
          { k: 'Consent and opt-out handling', v: 'built in, with the template discipline the platform requires and the consent record applicable data-protection law expects.' },
          { k: 'Full message log against the record', v: 'every message, delivery status and reply attached to the customer, invoice or case it concerns.' },
        ],
      },
    ],
    gain: [
      'Collections, document chasing and renewals stop depending on whose day is quiet. Follow-up becomes a property of the system rather than of an individual’s diligence — which is the difference between a process that degrades when someone is on leave and one that does not.',
      'Because every message is logged against the record, a dispute is settled from history instead of from memory, and the consent trail exists if anyone ever asks for it.',
    ],
    bestFit: 'follow-up currently happens from personal phones, when collection or document chasing is inconsistent across the team, or when nobody can reconstruct what was said to a customer and when.',
  },
  {
    id: 'custom-software-crm-portals',
    focus: 4,
    caption: 'Vertical III — Sheets: the record moved onto one layer.',
    n: '06',
    vertical: 'digital-foundation',
    title: 'Custom Software, CRM & Portals',
    short: 'Workflow-first internal systems and portals with audit trails and APIs from day one.',
    lede: 'The layer where work is actually captured — internal systems, client portals and CRM built around your workflow rather than around a product’s assumptions.',
    blocks: [
      {
        type: 'bullets', label: 'How we build it', cols: 1,
        items: [
          { k: 'Workflow first', v: 'we map how the work moves today, including the informal steps, before designing a screen.' },
          { k: 'Audit trails by default', v: 'who changed what, when, and what it was before. Retrofitting this later is expensive and usually incomplete.' },
          { k: 'API-first', v: 'every entity reachable programmatically from day one, so analytics and automation are never a bolt-on.' },
          { k: 'Role-based access', v: 'designed against your actual approval authority, not a generic admin/user split.' },
          { k: 'Migration with reconciliation', v: 'historic data moved and then proved to tie back, rather than imported and hoped over.' },
        ],
      },
    ],
    gain: [
      'Structured, trustworthy data is the precondition for both other verticals. You cannot automate, monitor or forecast against a process that lives in a WhatsApp group and three spreadsheets named <em>final_v2</em>. This is the foundation — and building it correctly once is materially cheaper than building it twice, which is the usual outcome when the intelligence layer is bought first.',
    ],
  },
  {
    id: 'mobile-applications',
    focus: 2,
    caption: 'Vertical III — Stock: captured where the fact happens.',
    n: '07',
    vertical: 'digital-foundation',
    title: 'Mobile Applications',
    short: 'Capture at the point the fact happens — field teams, offline-first, evidence attached at source.',
    lede: 'Capture at the point the fact happens — field teams, site operations, and customer-facing apps where the customer is the most reliable source.',
    blocks: [
      {
        type: 'bullets', label: 'What we build', cols: 2,
        items: [
          { v: 'Offline-first sync for sites with unreliable connectivity.' },
          { v: 'Photo, timestamp and location evidence attached at source.' },
          { v: 'Approvals and exception handling from the field.' },
          { v: 'Customer apps that turn service interactions into structured records.' },
        ],
      },
    ],
    gain: [
      'Data entered hours later at a desk is data that has already degraded — remembered, rounded, occasionally invented. Capture at source is the difference between a system that reflects your operations and one that reflects your paperwork, and every downstream detection you build inherits that difference.',
    ],
  },
  {
    id: 'growth-analytics-infrastructure',
    focus: 5,
    caption: 'Vertical III — Bank: spend tied to realised revenue.',
    n: '08',
    vertical: 'digital-foundation',
    title: 'Growth & Analytics Infrastructure',
    short: 'Instrumentation that connects spend to revenue rather than to traffic.',
    lede: 'Measurement that connects spend to revenue rather than to traffic, with the instrumentation to make the connection defensible.',
    blocks: [
      {
        type: 'bullets', label: 'What we build', cols: 1,
        items: [
          { k: 'Event instrumentation and server-side tracking', v: 'that survives browser restrictions and ad-blocking, so the data does not quietly thin out.' },
          { k: 'Closed loop to the ad platforms', v: 'realised CRM outcomes fed back, so optimisation targets revenue rather than form fills.' },
          { k: 'Cohort and unit economics', v: 'acquisition cost against realised value by channel, campaign and segment, over time rather than at a point.' },
          { k: 'Funnel diagnostics', v: 'that locate where people drop rather than reporting the total that survived.' },
        ],
      },
    ],
    gain: [
      'You learn which spend produced customers, not which produced clicks — and that changes what you cut. Most marketing budgets contain at least one line that has never been evaluated against revenue, because the measurement needed to do it was never built.',
      'It sits in the Digital Foundation vertical for a reason: attribution is a record-layer problem before it is a marketing problem. If the CRM does not know where a customer came from, no dashboard can tell you.',
    ],
    bestFit: 'spend has grown faster than the ability to justify it, when platform-reported numbers and finance-reported numbers disagree, or when nobody can say what a customer actually costs.',
  },
];

export const phases = [
  { n: '00', title: 'Scoping conversation', tag: 'No charge', exit: true, body: 'We establish what the operation looks like and whether there is anything here worth investigating. If there is not, we say so and the conversation ends. This is a real exit, not a formality.' },
  { n: '01', title: 'Business Health Check', tag: 'Fixed fee, time-boxed', exit: true, body: 'Vertical I. Produces the findings register, the root-cause analysis and the agreed measurement baseline. You can stop here — the register is yours either way.' },
  { n: '02', title: 'Prioritisation', tag: 'Joint', body: 'Findings ranked by value, effort and certainty, and mapped to the vertical that addresses them. You choose what proceeds. Not everything found should be fixed, and some of it is not a software problem at all.' },
  { n: '03', title: 'Build', tag: 'In live slices', body: 'Foundation before automation where the diagnostic calls for it. Each slice reaches production and delivers before the next one starts — no eighteen-month programme where the first value arrives at the end.' },
  { n: '04', title: 'Operate & measure', tag: 'Against the baseline', body: 'Recovered value measured against the Phase 01 baseline, on the method agreed before the build. Support and iteration run against what the measurement shows.' },
];

export const pricing = [
  { k: 'Scoping', v: 'No charge, no obligation.' },
  { k: 'Vertical I · diagnostic', v: 'Fixed fee, agreed in advance, scoped to the size and complexity of the operation. Time-boxed, with the deliverable defined before we begin.' },
  { k: 'Verticals II & III · build', v: 'Fixed scope and fixed price per slice. Change is handled as a priced change, not absorbed silently and recovered later.' },
  { k: 'Outcome-linked option', v: 'Where a finding has a measurable value and an agreed baseline, we can take a share of verified recovery — 25% — in place of a build fee. It requires a written measurement method agreed before the work, and we will not offer it where the measurement would be arguable.', highlight: true },
  { k: 'Automation · retainer', v: 'A monthly retainer scoped to the systems and workflows covered, so cost tracks what is actually in operation rather than an upfront licence that has to be recovered first.' },
  { k: 'Ownership', v: 'Code, data and infrastructure belong to you. Source is handed over. There is no exit penalty and nothing you need our continued involvement to keep running.' },
];

export const dataTerms = [
  { k: 'NDA first', v: 'Executed before any data moves, covering the engagement and surviving it.' },
  { k: 'Least privilege', v: 'Read-only where read-only is sufficient, scoped to named systems and periods, revocable by you at any time without notice.' },
  { k: 'Defined retention', v: 'Retention period agreed in writing, with certified deletion at the end of it.' },
  { k: 'No external model training', v: 'Your data is never used to train models outside your engagement, and never used to serve another client.' },
  { k: 'Regulatory alignment', v: 'Handling aligned to the Digital Personal Data Protection Act, 2023 and its Rules for personal data in India, and to GDPR requirements where EU data subjects are involved.' },
  { k: 'Auditable tooling', v: 'Your data does not enter a tool whose data handling we cannot inspect and explain to you.' },
];

export const limits = [
  { lead: 'Quote you a saving before we have measured your baseline.', more: 'A number produced that way is marketing, and it is the reason most such numbers are never revisited after signature.' },
  { lead: 'Sell a system for a problem we have not evidenced.', more: 'Including when you have already decided you want that system.' },
  { lead: 'Take an outcome-linked fee without a written measurement method.', more: 'One both sides can compute independently.' },
  { lead: 'Present a finding we cannot trace to specific records in your systems.', more: '' },
  { lead: 'Take an engagement where the honest answer is that you do not need us.', more: 'We would rather lose the fee than be the vendor you regret.' },
];

// Loss domains offered on the scoping form (from the Business Health Check)
export const leakDomains = [
  ['Revenue & billing', 'Revenue & billing'],
  ['Procurement & vendors', 'Procurement & vendors'],
  ['Inventory & working capital', 'Inventory'],
  ['Receivables & collection', 'Receivables'],
  ['Compliance & tax', 'Compliance & tax'],
  ['Manual effort & duplication', 'Manual effort'],
  ['Data integrity across systems', 'Systems disagree'],
  ['Not sure yet', 'Not sure yet'],
];

export const whereToday =
  'Worksmith is an early-stage company. We would rather state that plainly than imply a track record we have not yet built — which is precisely why our commercial terms put the risk of being wrong on us, and why every claim on this site is about method rather than about results we cannot yet evidence.';
