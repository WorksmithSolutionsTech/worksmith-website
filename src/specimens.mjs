// One specimen per service: the artifact the work actually produces.
// Every value is illustrative and masked where a real figure would sit — the site makes no result claims.

const cap = (n, title) => `
  <figcaption class="spec-cap">
    <span class="spec-no mono">Fig. S-${n}</span>
    <span class="spec-title">${title}</span>
    <span class="stamp mono">Specimen · illustrative</span>
  </figcaption>`;

const S = {};

S['business-health-check'] = `
<figure class="spec spec-register">
  ${cap('01', 'The findings register — what the diagnostic hands over')}
  <div class="spec-scroll" tabindex="0" role="region" aria-label="Findings register specimen">
    <table>
      <thead><tr><th>Ref</th><th>Finding</th><th>Domain</th><th class="r">Amount</th><th>Traced to</th><th>Method</th><th>Confidence</th><th>Cause</th></tr></thead>
      <tbody>
        <tr><td class="mono">F-01</td><td><b>Delivered, never invoiced</b></td><td>Revenue &amp; billing</td><td class="amt mono">₹ ••,••,•••</td><td>Dispatch notes with no invoice line</td><td>Dispatch ↔ invoice ↔ ledger match</td><td><span class="conf is-high">High</span></td><td>Process</td></tr>
        <tr><td class="mono">F-02</td><td><b>One item, three prices</b></td><td>Procurement</td><td class="amt mono">₹ •,••,•••</td><td>PO lines for one SKU, two sites</td><td>Price variance by item and week</td><td><span class="conf is-high">High</span></td><td>System</td></tr>
        <tr><td class="mono">F-03</td><td><b>Input credit at risk</b></td><td>Compliance &amp; tax</td><td class="amt mono">₹ •,••,•••</td><td>Purchase register vs vendor filings</td><td>Vendor filing behaviour</td><td><span class="conf is-med">Medium</span></td><td>Data</td></tr>
        <tr><td class="mono">F-04</td><td><b>A receivable nobody chases</b></td><td>Receivables</td><td class="amt mono">₹ ••,•••</td><td>Ageing report vs follow-up log</td><td>Last-touch interval by owner</td><td><span class="conf is-med">Medium</span></td><td>Incentive</td></tr>
      </tbody>
    </table>
  </div>
  <p class="spec-foot">Amounts are masked here. In your register every row carries a figure in your currency, the rows it came from, and a confidence rating we are prepared to defend.</p>
</figure>`;

S['operational-intelligence-systems'] = `
<figure class="spec spec-alert">
  ${cap('02', 'An alert, as it arrives')}
  <ol class="chain mono" aria-label="Method">
    <li>Connect</li><li>Graph</li><li>Detect</li><li class="on">Evidence</li><li class="on">Escalate</li>
  </ol>
  <div class="alert">
    <div class="alert-top"><span class="mono">Alert · OIS-••••</span><span class="pill mono">Open · due in 48 h</span></div>
    <h4>A receivable stopped being chased</h4>
    <p class="alert-why">Follow-up on this customer stopped when the account owner changed roles. Ageing has crossed the threshold you set.</p>
    <dl class="alert-meta">
      <div><dt class="mono">Owner</dt><dd>Collections lead</dd></div>
      <div><dt class="mono">Deadline</dt><dd>48 hours</dd></div>
      <div><dt class="mono">If silent</dt><dd>Escalates to Finance head</dd></div>
    </dl>
    <div class="alert-ev">
      <p class="mono">Evidence attached · 3 records</p>
      <ul>
        <li><span>Open invoice</span><span class="mono">ERP · INV-••••</span></li>
        <li><span>Last follow-up</span><span class="mono">WhatsApp log · 41 days ago</span></li>
        <li><span>Owner change</span><span class="mono">HR system · role updated</span></li>
      </ul>
    </div>
    <ol class="track mono">
      <li class="done">Detected</li><li class="done">Evidence attached</li><li class="now">Owner notified</li><li>Escalated on silence</li><li>Closed · resolution recorded</li>
    </ol>
  </div>
</figure>`;

S['business-process-automation'] = `
<figure class="spec spec-flow">
  ${cap('03', 'Order to cash, mapped — then trimmed before anything is automated')}
  <ol class="flow">
    <li class="k-keep"><i></i><b>Quote</b><span>CRM</span></li>
    <li class="k-cut"><i></i><b>Re-key order into ERP</b><span>Removed — existed only for the old system</span></li>
    <li class="k-auto"><i></i><b>Credit approval</b><span>Routed to a named approver with a deadline</span></li>
    <li class="k-keep"><i></i><b>Dispatch</b><span>ERP · proof of delivery</span></li>
    <li class="k-auto"><i></i><b>Invoice</b><span>Raised from the dispatch record, not from memory</span></li>
    <li class="k-exc"><i></i><b>Price mismatch</b><span>Exception → owner, logged and reversible</span></li>
    <li class="k-auto"><i></i><b>Follow-up</b><span>Sequence that escalates on silence</span></li>
    <li class="k-keep"><i></i><b>Collection</b><span>Bank · reconciled to the invoice</span></li>
  </ol>
  <ul class="legend-p mono">
    <li><i class="k-auto"></i>Automated</li><li><i class="k-keep"></i>Unchanged</li><li><i class="k-cut"></i>Removed, not encoded</li><li><i class="k-exc"></i>Exception with an owner</li>
  </ul>
  <p class="spec-foot">Once the process runs in software, two numbers become visible that rarely are: cycle time end to end, and touch count.</p>
</figure>`;

S['ai-agent-development'] = `
<figure class="spec spec-gate">
  ${cap('04', 'Where an agent stops, and what it can never do')}
  <div class="gate">
    <div class="gate-bar" aria-hidden="true">
      <span class="z-ask">Stops and asks a person</span>
      <span class="z-go">Acts inside the gates</span>
      <span class="gate-line"><b class="mono">Threshold agreed with you</b></span>
    </div>
    <div class="gate-axis mono"><span>Low confidence</span><span>High confidence</span></div>
  </div>
  <div class="gate-grid">
    <div class="agent-log">
      <p class="mono">Run log · invoice intake</p>
      <ol class="mono">
        <li><span>09:02</span>Invoice PDF read · vendor matched</li>
        <li><span>09:02</span>Validated against PO and goods receipt</li>
        <li class="hold"><span>09:03</span>Above value gate → sent for approval</li>
        <li><span>11:40</span>Approved by Finance · posted</li>
        <li><span>11:40</span>Inputs, reasoning and result logged</li>
      </ol>
    </div>
    <dl class="gate-rules">
      <div><dt class="mono">Value gate</dt><dd>Above your limit, an approval step comes before any posting.</dd></div>
      <div><dt class="mono">Blocked actions</dt><dd>Configured by you and enforced outside the model — for example, changing a vendor’s bank details.</dd></div>
      <div><dt class="mono">Deterministic core</dt><dd>Calculations, postings and compliance logic run as code. The model interprets; it does not add up.</dd></div>
    </dl>
  </div>
</figure>`;

S['whatsapp-communication-automation'] = `
<figure class="spec spec-seq">
  ${cap('05', 'A follow-up that does not stop at the first silence')}
  <div class="thread">
    <div class="msg out">
      <p class="mono">Day 0 · Approved template · consent on record</p>
      <p>Invoice INV-•••• is due on the 15th. Reply PAID, or attach the remittance advice here.</p>
      <span class="meta mono">Delivered</span>
    </div>
    <div class="msg out">
      <p class="mono">Day 3 · Reminder</p>
      <p>A reminder on INV-••••. Attach the remittance advice and we will close it on our side.</p>
      <span class="meta mono">Read · no reply</span>
    </div>
    <p class="silence mono"><span></span>72 hours of silence<span></span></p>
    <div class="msg hand">
      <p class="mono">Day 6 · Handed to a person</p>
      <p>Account owner takes over, with the full thread and the invoice attached.</p>
    </div>
    <div class="msg in">
      <p class="mono">Day 6 · Reply</p>
      <p><span class="file mono">remittance.pdf</span></p>
      <span class="meta mono">Filed against INV-•••• automatically</span>
    </div>
  </div>
</figure>`;

S['custom-software-crm-portals'] = `
<figure class="spec spec-audit">
  ${cap('06', 'The audit trail — on from the first day, not retrofitted')}
  <div class="spec-scroll" tabindex="0" role="region" aria-label="Audit trail specimen">
    <table>
      <thead><tr><th>When</th><th>Who</th><th>Record</th><th>Field</th><th>Before</th><th>After</th><th>Control</th></tr></thead>
      <tbody>
        <tr><td class="mono">Today 10:14</td><td>Sales manager</td><td class="mono">Customer C-••••</td><td>Credit limit</td><td class="mono was">5,00,000</td><td class="mono">7,50,000</td><td><span class="conf is-high">Approved · Finance head</span></td></tr>
        <tr><td class="mono">Today 09:51</td><td>Accounts executive</td><td class="mono">Vendor V-••••</td><td>Bank account</td><td class="mono was">••••4821</td><td class="mono">••••9034</td><td><span class="conf is-hold">Held · second approval</span></td></tr>
        <tr><td class="mono">Yesterday 18:02</td><td>Site supervisor</td><td class="mono">Order SO-••••</td><td>Delivery date</td><td class="mono was">12 Sep</td><td class="mono">14 Sep</td><td><span class="conf is-med">Within role</span></td></tr>
      </tbody>
    </table>
  </div>
  <p class="spec-foot">Access follows your actual approval authority. Every entity is reachable through the API, so analytics and automation are never a bolt-on.</p>
</figure>`;

S['mobile-applications'] = `
<figure class="spec spec-field">
  ${cap('07', 'A record made where the fact happened')}
  <div class="field-grid">
    <div class="device">
      <div class="dev-top mono"><span>Proof of delivery</span><span class="off">Offline · queued</span></div>
      <div class="dev-photo" aria-hidden="true"><i></i><span class="mono">Photo · taken at source</span></div>
      <dl class="dev-meta">
        <div><dt class="mono">Timestamp</dt><dd class="mono">14:32:07 IST · device + server</dd></div>
        <div><dt class="mono">Location</dt><dd class="mono">17.4•••, 78.3••• · ±8 m</dd></div>
        <div><dt class="mono">Received by</dt><dd>Signature captured</dd></div>
        <div><dt class="mono">Items</dt><dd class="mono">24 of 24</dd></div>
      </dl>
      <p class="dev-sync mono"><i></i>Synced when signal returned · 14:51</p>
    </div>
    <ul class="field-notes">
      <li><b>Offline-first.</b> The site has no signal; the record is still made, then synced.</li>
      <li><b>Evidence at source.</b> Photo, time and place are attached when the fact happens, not typed in later.</li>
      <li><b>Exceptions from the field.</b> A short delivery is raised and approved on the spot.</li>
    </ul>
  </div>
</figure>`;

S['growth-analytics-infrastructure'] = `
<figure class="spec spec-loop">
  ${cap('08', 'Spend connected to revenue, not to traffic')}
  <ol class="loop">
    <li><span class="mono">01</span><b>Ad platform</b><span>Campaign and spend</span></li>
    <li><span class="mono">02</span><b>Visit</b><span>Server-side event that survives ad-blocking</span></li>
    <li><span class="mono">03</span><b>Lead in CRM</b><span>Source kept on the record</span></li>
    <li><span class="mono">04</span><b>Won deal</b><span>Realised value, from finance</span></li>
  </ol>
  <div class="loop-back" aria-hidden="true">
    <svg viewBox="0 0 1000 40" preserveAspectRatio="none"><path d="M960 2 V30 H40 V8" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/><path d="M32 14 L40 2 L48 14" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
    <span class="mono">Realised outcome fed back — the platform optimises for revenue, not form fills</span>
  </div>
  <div class="funnel">
    <p class="mono">Funnel diagnostics · where people drop, not the total that survived</p>
    <ol>
      <li style="--w:100%"><span>Visited</span></li>
      <li style="--w:82%"><span>Started enquiry</span></li>
      <li style="--w:34%" class="drop"><span>Completed enquiry</span><em class="mono">largest drop — located</em></li>
      <li style="--w:27%"><span>Qualified</span></li>
      <li style="--w:12%"><span>Won</span></li>
    </ol>
  </div>
</figure>`;

export const specimen = (id) => S[id] || '';
