// Page forwarding rules — single source for Netlify (_redirects), Vercel (vercel.json),
// Apache (.htaccess) and the HTML fallback pages. Format: [from, to, comment?, options?]
// options.stub === false → no HTML fallback page is generated for that path.

export const redirects = [
  // Short links — use these on cards, decks and WhatsApp
  ['/diagnostic', '/services/business-health-check/', 'Short links'],
  ['/health-check', '/services/business-health-check/'],
  ['/intelligence', '/services/operational-intelligence-systems/'],
  ['/automation', '/verticals/workflow-automation/'],
  ['/agents', '/services/ai-agent-development/'],
  ['/whatsapp', '/services/whatsapp-communication-automation/'],
  ['/foundation', '/verticals/digital-foundation/'],
  ['/crm', '/services/custom-software-crm-portals/'],
  ['/apps', '/services/mobile-applications/'],
  ['/analytics', '/services/growth-analytics-infrastructure/'],
  ['/book', '/contact/'],
  ['/scoping', '/contact/'],
  ['/start', '/contact/'],

  // Common guesses
  ['/about', '/approach/', 'Common guesses'],
  ['/about-us', '/approach/'],
  ['/contact-us', '/contact/'],
  ['/method', '/how-we-work/'],
  ['/process', '/how-we-work/'],
  ['/fees', '/pricing/'],
  ['/security', '/data-and-limits/'],
  ['/verticals', '/services/'],
  ['/privacy-policy', '/privacy/', 'Legal'],
  ['/terms-of-use', '/terms/'],
  ['/terms-and-conditions', '/terms/'],
  ['/tos', '/terms/'],
  ['/legal', '/privacy/'],

  // Legacy file names
  ['/about.html', '/approach/', 'Legacy file names'],
  ['/services.html', '/services/'],
  ['/contact.html', '/contact/'],
  ['/pricing.html', '/pricing/'],

  // CA Workflow Automation is not part of this site. Repoint these to the CA product site once it is live.
  ['/services/ca-workflow-automation', '/verticals/workflow-automation/', 'Removed service (portfolio 2026, service 04)', { stub: false }],
  ['/ca-workflow-automation', '/verticals/workflow-automation/', null, { stub: false }],
];
