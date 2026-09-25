// Website legal terms — Privacy Policy (Part A) and Terms of Use (Part B).
// Source: "Worksmith Website Privacy Policy and Terms of Use — DRAFT 1" (Aug 2026).
//
// BEFORE PUBLISHING: the draft says it has not been settled by a qualified Indian legal practitioner.
// When counsel has signed off, set `reviewed: true` and fill in `effective` (e.g. '1 October 2026').
// Until then each page shows a draft notice, carries noindex, and every placeholder is highlighted.
//
// Mini-syntax used below
//   ## n  Title            a numbered section
//   n.n   text             a clause
//   (a)   text             a lettered item under the clause above
//   +     text             a paragraph continuing the clause above (after its list or table)
//   |a|b                   a table row (the first row of a table is its header)
//   **Lead.**              bold lead-in          {{text}}  placeholder to complete
//   [[privacy#s-6|label]]  link to the other document / a section

export const legalMeta = {
  reviewed: false,
  effective: '',      // e.g. '1 October 2026'
  version: '1.0',
  updated: 'August 2026',
};

export const entity = {
  name: 'Worksmith Solutions Private Limited',
  cin: 'U62013TS2026PTC221259',
  office: 'Flat No 207, ND 1, Puppalaguda, Myscape Rd, Gachibowli, Seri Lingampally, K.V. Rangareddy – 500032, Telangana, India',
  email: 'contact@worksmith.tech',
  phone: '+91 90309 99860',
  grievance: 'Grievance Officer, Worksmith Solutions Private Limited',
};

const EFFECTIVE = () => `Effective date: ${legalMeta.effective || '{{[insert date]}}'}. Version: ${legalMeta.reviewed ? legalMeta.version : `{{[${legalMeta.version}]}}`}.`;

export const privacySrc = () => `
## 1 Who we are and what this policy covers
1.1 Worksmith Solutions Private Limited (CIN U62013TS2026PTC221259), a company incorporated under the Companies Act, 2013 and having its registered office at Flat No 207, ND 1, Puppalaguda, Myscape Rd, Gachibowli, Seri Lingampally, K.V. Rangareddy – 500032, Telangana, India (“Worksmith”, “we”, “us”, “our”) operates the website at worksmith.tech (the “Website”).
1.2 This Privacy Policy explains how we collect, use, disclose, retain and protect personal data of visitors to the Website and of persons who contact us through it, and describes the rights available to you under the Digital Personal Data Protection Act, 2023 (the “DPDP Act”) and the rules made thereunder.
1.3 **Scope limitation.** This Privacy Policy governs personal data processed through the Website only. It does not govern data processed in the course of a client engagement. Where we are engaged to perform diagnostic, reconciliation, automation or advisory services, the treatment of client data — including any personal data contained within accounting records, ledgers, invoices, payroll files, contracts or systems to which we are given access — is governed exclusively by the engagement agreement and the data processing terms executed with that client, and not by this Privacy Policy.
1.4 In respect of personal data processed through the Website, Worksmith acts as a Data Fiduciary within the meaning of the DPDP Act. In respect of personal data processed on a client’s instructions during an engagement, Worksmith ordinarily acts as a Data Processor for that client, who remains the Data Fiduciary.
1.5 ${EFFECTIVE()}

## 2 Definitions
2.1 Terms used in this Privacy Policy which are defined in the DPDP Act carry the meaning given to them in that Act. In particular:
(a) “Personal Data” means any data about an individual who is identifiable by or in relation to such data.
(b) “Data Principal” means the individual to whom the Personal Data relates.
(c) “Data Fiduciary” means the person who alone or in conjunction with others determines the purpose and means of processing Personal Data.
(d) “Data Processor” means a person who processes Personal Data on behalf of a Data Fiduciary.
(e) “Processing” means any operation performed on Personal Data, including collection, storage, use, sharing, alteration, retention or erasure.

## 3 Personal data we collect
3.1 We collect only what we need, and we collect it in three ways:
|Category|What it comprises and how it is collected
|Information you give us|Name, business email address, telephone number, company name, designation, sector, approximate turnover band, accounting or ERP system in use, and the content of any message you send — collected when you complete an enquiry form, email us, or otherwise contact us.
|Information collected automatically|IP address, browser type and version, device and operating system, referring URL, pages viewed, time and duration of visit, and similar technical data, collected through server logs and, where enabled, analytics cookies. See [[#s-6|Clause 6]].
|Information from third parties|Publicly available business information (for example a company website, MCA filings or a public professional profile) which we may consult to understand an enquiry before responding.
3.2 We do not knowingly seek, and ask that you do not send us through the Website, any financial records, ledgers, client data, or sensitive personal information. See [[terms#s-9|Clause 9 of the Terms of Use]] regarding unsolicited submissions.

## 4 Purposes for which we process personal data
4.1 We process personal data collected through the Website for the following specified purposes, and for no other purpose without obtaining fresh consent:
(a) to respond to your enquiry and to correspond with you about it;
(b) to assess whether a prospective engagement falls within our service scope and client profile;
(c) to prepare for and conduct discussions, proposals and, if agreed, an engagement;
(d) to operate, secure, maintain and improve the Website, including diagnosing faults and preventing misuse, fraud or unauthorised access;
(e) to send you information about our services where you have separately consented to receive it, with an unsubscribe facility in every such communication; and
(f) to comply with applicable law, and to establish, exercise or defend legal claims.
4.2 **Lawful basis.** We process personal data collected through the Website on the basis of your consent, obtained at the point of collection through a clear affirmative action, or on the basis of legitimate uses permitted under Section 7 of the DPDP Act where applicable.
4.3 We do not sell personal data. We do not use personal data collected through the Website for automated decision-making producing legal effects, and we do not use it to train machine-learning models.
4.4 **Commercial communications.** Any promotional communication we send by telephone, SMS or messaging application is sent in accordance with the Telecom Commercial Communications Customer Preference Regulations, 2018 and the preferences you have registered with your access provider. Every promotional email we send carries an unsubscribe facility, and we act on an unsubscribe request without charge and without undue delay.

## 5 Consent, and how to withdraw it
5.1 Where we rely on your consent, that consent is sought through a clear, specific and unambiguous affirmative action, accompanied by a notice describing the personal data to be collected and the purpose of processing.
5.2 You may withdraw your consent at any time, with the same ease with which it was given, by writing to contact@worksmith.tech with the subject line “Withdrawal of Consent”.
5.3 Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal. Following withdrawal, we will cease processing within a reasonable period and will erase the relevant personal data unless retention is required under [[#s-8|Clause 8]].
5.4 **Notice at the point of collection.** This Privacy Policy is a general statement of our practices and does not by itself constitute the notice required under Section 5 of the DPDP Act. Wherever we collect personal data on the basis of consent, a separate, itemised notice is presented to you at or before the point of collection, describing the specific personal data sought, the specific purpose for which it will be processed, the manner in which you may exercise your rights, and the manner in which you may complain to the Data Protection Board of India. That notice is available in English and, on request, in any language specified in the Eighth Schedule to the Constitution of India.

## 6 Cookies and similar technologies
6.1 Cookies are small text files placed on your device. We use only the following categories:
|Category|Purpose and basis
|Strictly necessary|Required for the Website to function and to be secure. Set without consent, as permitted.
|Analytics / performance|Used to understand how the Website is used so that we can improve it. Set only where you have given consent through the cookie banner, and capable of being declined without loss of access to the Website.
6.2 A full list of cookies in use, their provider, purpose and duration is maintained at {{[link to Cookie Policy]}}. You may withdraw or change your cookie preferences at any time through the cookie settings link in the Website footer, and you may block or delete cookies through your browser settings.
6.3 We do not use cookies for cross-site behavioural advertising.

## 7 Disclosure and transfer
7.1 We do not disclose personal data collected through the Website except as set out below:
(a) **Service providers.** To vendors who process personal data on our behalf and on our documented instructions — for example website hosting, email, customer-relationship and analytics providers. Each such provider is engaged under a written contract imposing confidentiality and security obligations, and is prohibited from using the data for its own purposes.
(b) **Professional advisers.** To our lawyers, auditors, accountants and insurers, each of whom is bound by professional duties of confidentiality.
(c) **Legal and regulatory.** Where disclosure is required by law, by a court of competent jurisdiction, or by a regulatory or governmental authority acting within its powers.
(d) **Corporate transactions.** To a proposed acquirer, investor or successor in the event of a merger, acquisition, restructuring or sale of assets, subject to confidentiality undertakings, and provided the recipient is bound to treat the data in accordance with this Privacy Policy.
7.2 **Cross-border transfer.** Certain of our service providers may store or process personal data outside India. We transfer personal data outside India only to countries not restricted by the Central Government under Section 16 of the DPDP Act, and only where the recipient is bound by contractual obligations providing a comparable standard of protection. A list of the jurisdictions in which your personal data may be processed is available on request.

## 8 Retention and erasure
8.1 We retain personal data only for as long as is necessary for the purpose for which it was collected, or for such longer period as is required by law.
|Data|Retention period
|Enquiry data where no engagement follows|24 months from last contact, then erased
|Enquiry and correspondence data where an engagement follows|For the duration of the engagement and 8 years thereafter, consistent with statutory record-retention and limitation periods
|Server logs, traffic data and processing logs|12 months, this being the minimum retention period prescribed under the DPDP Rules
|Marketing consent records|Until consent is withdrawn, plus 3 years as evidence of the consent given
8.2 On expiry of the applicable period, or on withdrawal of consent where no other basis for retention exists, we erase the personal data and require our processors to do the same, save where retention is necessary for compliance with law or for the establishment, exercise or defence of legal claims.

## 9 Security
9.1 We implement reasonable security safeguards designed to prevent personal data breach, appropriate to the nature of the data and the risk involved. These include encryption in transit, access controls on a need-to-know basis, authentication requirements, logging, and contractual security obligations on our processors.
9.2 No system is entirely secure. While we take the measures described above, we do not and cannot warrant that the Website or any transmission to it is immune from unauthorised access, and any transmission of information over the internet is undertaken at your own risk. Nothing in this Clause limits our obligations under the DPDP Act, which are not capable of being contracted out of.

## 10 Personal data breach
10.1 In the event of a personal data breach affecting personal data for which we are the Data Fiduciary, we will intimate each affected Data Principal without delay, through the mode of communication registered with us.
10.2 We will also intimate the Data Protection Board of India without delay upon becoming aware of the breach, and will furnish the detailed particulars required under the DPDP Rules within seventy-two (72) hours of becoming aware, or within such longer period as the Board may on request allow.
10.3 Our intimation will describe, so far as known, the nature, extent and timing of the breach, its likely consequences, the measures we have taken to mitigate risk, the safeguards you may take to protect your interests, and the contact point for further information.

## 11 Your rights as a Data Principal
11.1 Subject to the DPDP Act, you have the following rights in respect of personal data we hold about you:
(a) **Right to access.** To obtain a summary of the personal data being processed, the processing activities undertaken, and the identities of any other Data Fiduciaries or processors with whom it has been shared.
(b) **Right to correction and erasure.** To have inaccurate or misleading personal data corrected, incomplete data completed, data updated, and data erased where it is no longer necessary for the purpose for which it was collected.
(c) **Right to withdraw consent.** As set out in [[#s-5|Clause 5]].
(d) **Right of grievance redressal.** To a readily available means of registering a grievance with us, as set out in [[#s-13|Clause 13]].
(e) **Right to nominate.** To nominate another individual to exercise your rights in the event of your death or incapacity.
11.2 To exercise any right, write to contact@worksmith.tech, or use the facility provided on the Website. We will act on a valid request without undue delay and in any event within thirty (30) days of receipt. We may ask you for information reasonably necessary to verify your identity before acting on a request, and may decline a request only where permitted by law, giving reasons.
11.3 You are responsible for the accuracy of the information you furnish to us, and for not impersonating another person or furnishing false particulars when exercising a right. The DPDP Act provides for penalties against Data Principals who raise false or frivolous grievances.

## 12 Children and persons with disability
12.1 The Website is intended for business users and is not directed at children. We do not knowingly collect personal data of any individual below the age of eighteen years.
12.2 We do not undertake tracking, behavioural monitoring or targeted advertising directed at children. Where we become aware that we hold personal data of a child without verifiable consent of a parent or lawful guardian, we will erase it promptly.
12.3 Where personal data of a person with disability who has a lawful guardian is to be processed, we will process it only with the verifiable consent of that guardian.

## 13 Grievance Officer and how to complain
13.1 Any grievance concerning our processing of your personal data, or the exercise of your rights, may be addressed to:
@grievance
13.2 We will acknowledge every grievance on receipt and will respond to it within ninety (90) days of receipt, that being the maximum period prescribed under the DPDP Rules. We will ordinarily respond substantially sooner.
13.3 You must exhaust this grievance mechanism before approaching the Data Protection Board of India. If you are not satisfied with our response, or if we fail to respond within the period stated above, you may complain to the Data Protection Board of India in accordance with the DPDP Act.

## 14 Changes to this policy
14.1 We may amend this Privacy Policy from time to time. The version in force is the version published on the Website, and the effective date appears at [[#c-1-5|Clause 1.5]].
14.2 Where an amendment materially changes the purposes for which we process personal data collected on the basis of your consent, we will seek fresh consent before applying the change to that data.
`;

export const termsSrc = () => `
## 1 These Terms, and your acceptance of them
1.1 These Terms of Use (“Terms”) govern your access to and use of the website at worksmith.tech and all content, materials and functionality made available through it (together, the “Website”), operated by Worksmith Solutions Private Limited (CIN U62013TS2026PTC221259) (“Worksmith”, “we”, “us”).
1.2 By accessing, browsing or using the Website you confirm that you have read, understood and agree to be bound by these Terms and by the [[privacy|Privacy Policy]], which is incorporated into these Terms by reference. If you do not agree, you must not use the Website.
1.3 You represent that you are at least eighteen years of age and, where you access the Website on behalf of an entity, that you are authorised to bind that entity to these Terms.
1.4 ${EFFECTIVE()} We may amend these Terms by publishing an amended version showing a revised effective date. Where an amendment materially affects your rights or obligations, we will display a prominent notice on the Website for not less than thirty (30) days before it takes effect. Your continued use of the Website after an amendment takes effect constitutes acceptance of it; if you do not accept an amendment, your remedy is to cease using the Website.

## 2 Scope — what these Terms do and do not govern
2.1 These Terms govern use of the Website only. They are not an offer to provide services, do not constitute an engagement, and do not create any client relationship, retainer, fiduciary duty or duty of care between you and Worksmith.
2.2 Any provision of services by Worksmith — including any diagnostic, reconciliation, leakage-detection, automation, agent-deployment or advisory service — is governed exclusively by a separate written engagement agreement executed between Worksmith and the client, together with any statement of work, data processing terms and non-disclosure agreement forming part of it (together, the “Engagement Documents”).
2.3 In the event of any conflict or inconsistency between these Terms and the Engagement Documents in relation to services, the Engagement Documents prevail. Nothing on the Website varies, supplements or overrides the Engagement Documents, and no statement on the Website may be relied upon as a term of any engagement.

## 3 No professional advice, and no reliance
3.1 Worksmith is not a firm of chartered accountants. Worksmith is not registered with the Institute of Chartered Accountants of India, does not hold a certificate of practice, and does not provide statutory audit, assurance, attestation, certification or any other service reserved to chartered accountants under the Chartered Accountants Act, 1949.
3.2 Worksmith is not a firm of advocates or legal practitioners, is not a registered investment adviser, and is not a registered valuer. Nothing on the Website constitutes legal, tax, accounting, audit, investment, valuation or financial advice.
3.3 All content on the Website is provided for general information only. It is not tailored to your circumstances, may not be current, and must not be acted upon without obtaining professional advice appropriate to your situation. You are solely responsible for any decision you take, or refrain from taking, on the basis of anything published on the Website.
3.4 **Illustrative and modelled figures.** Any figure, percentage, range, benchmark, saving, recovery, timeline or outcome referred to on the Website is illustrative or modelled unless it is expressly stated to be a measured result of a completed engagement. Illustrative and modelled figures are estimates based on stated assumptions, are not a forecast, do not constitute a representation, warranty, promise or guarantee as to any result, and must not be relied upon. Results vary materially with the quality and completeness of a client’s data, its systems, its controls and its cooperation. Past results, where cited, are not a guarantee of future results.
3.5 Statements on the Website concerning our plans, capabilities under development, roadmap or intentions are forward-looking and are subject to change without notice.

## 4 Permitted use and licence
4.1 Subject to your compliance with these Terms, we grant you a limited, personal, non-exclusive, non-transferable, non-sublicensable, revocable licence to access and view the Website for your internal business evaluation purposes.
4.2 You may print or download individual pages for your own internal reference, provided you do not remove or alter any proprietary notice. All other rights are reserved.
4.3 This licence terminates automatically on any breach of these Terms, and may be revoked by us at any time without notice.

## 5 Prohibited conduct
5.1 You must not, and must not permit any person to:
(a) copy, reproduce, republish, distribute, sell, licence, frame, mirror or exploit any part of the Website for any commercial purpose, except as expressly permitted by [[#s-4|Clause 4]];
(b) use any robot, spider, scraper, crawler, data-mining tool or other automated means to access, monitor or extract content from the Website, or to compile a database or dataset from it, whether for the training of machine-learning models or otherwise;
(c) reverse engineer, decompile, disassemble or otherwise attempt to derive the source code, structure, methodology or underlying logic of any part of the Website or of any demonstration, tool or output made available through it;
(d) probe, scan or test the vulnerability of the Website or any network, or breach or circumvent any security or authentication measure, without our prior written authorisation;
(e) introduce any virus, worm, trojan, logic bomb or other malicious code, or take any action that imposes an unreasonable or disproportionate load on our infrastructure;
(f) use the Website in any manner that is unlawful, fraudulent, defamatory, obscene, or that infringes the rights of any person, or that violates the Information Technology Act, 2000 or any rules made under it;
(g) impersonate any person, misrepresent your affiliation, or submit information that is false or misleading; or
(h) use the Website or its content to develop, train or benchmark any product or service that competes with Worksmith.
5.2 We reserve the right to investigate any suspected breach of this Clause, to suspend or block access, and to report the matter to law enforcement or regulatory authorities.

## 6 Intellectual property
6.1 All intellectual property rights in and to the Website and its contents — including all text, graphics, layout, design, source and object code, the Worksmith name, logo, monogram, wordmark and trade dress, and all methodologies, frameworks, agent designs, prompts, schema definitions, detection logic, models, leakage taxonomies, workbooks, diagrams and other materials made available through the Website — are owned by or licensed to Worksmith and are protected under the Copyright Act, 1957, the Trade Marks Act, 1999 and other applicable laws.
6.2 No right, title, interest or licence in any such intellectual property is granted to you except as expressly set out in [[#s-4|Clause 4]]. No provision of these Terms operates as an assignment of any intellectual property.
6.3 You must not use the Worksmith name or marks, or any confusingly similar mark, in any manner, including in metadata, advertising, keywords or domain names, without our prior written consent.

## 7 Feedback
7.1 If you send us any comment, suggestion, idea or feedback concerning the Website or our services (“Feedback”), you grant us a perpetual, irrevocable, worldwide, royalty-free, sublicensable and transferable licence to use, reproduce, modify and exploit that Feedback for any purpose, without obligation of confidentiality, attribution or compensation.
7.2 You warrant that you are entitled to grant that licence and that the Feedback does not infringe the rights of any third party.

## 8 Third-party links and content
8.1 The Website may contain links to third-party websites or resources. Such links are provided for convenience only. We do not control, endorse, or accept responsibility for any third-party website or its content, products, services, or privacy practices, and your use of any such website is at your own risk and subject to that website’s own terms.

## 9 Unsolicited submissions and confidentiality
9.1 **Do not send us confidential information through the Website.** Enquiry forms and email addresses published on the Website are not secure channels and are not intended for the transmission of financial records, ledgers, statements, customer data, employee data, trade secrets or any other confidential or sensitive material.
9.2 Any information you send to us through the Website before an engagement agreement and non-disclosure agreement are executed will be treated as non-confidential, and we accept no obligation of confidentiality in respect of it, save for personal data, which is handled in accordance with the [[privacy|Privacy Policy]] and applicable law.
9.3 Confidentiality obligations arise only upon execution of a written non-disclosure agreement or an engagement agreement containing confidentiality terms.

## 10 Availability of the Website
10.1 We do not warrant that the Website will be available uninterrupted, timely, secure or error-free. We may suspend, withdraw, discontinue or change all or any part of the Website without notice and without liability.
10.2 You are responsible for arranging your own access to the Website and for ensuring that all persons accessing it through your connection are aware of these Terms and comply with them.

## 11 Disclaimer of warranties
11.1 To the fullest extent permitted by applicable law, the Website and all content on it are provided on an “as is” and “as available” basis, and we exclude all conditions, warranties, representations and other terms which might otherwise be implied by statute, common law or the law of equity, including as to accuracy, completeness, currency, merchantability, fitness for a particular purpose, quiet enjoyment and non-infringement.
11.2 Nothing in this Clause excludes or limits any liability which cannot lawfully be excluded or limited under Indian law, including liability for fraud or fraudulent misrepresentation, for death or personal injury caused by negligence, or under the Consumer Protection Act, 2019 where it applies.

## 12 Limitation of liability
12.1 Subject always to [[#c-12-4|Clause 12.4]], we shall not be liable to you, whether in contract, tort (including negligence), breach of statutory duty or otherwise, for any of the following arising out of or in connection with your use of, or inability to use, the Website or reliance on any content published on it:
(a) loss of profit, revenue, business, contracts, anticipated savings, or opportunity;
(b) loss of or corruption of data;
(c) loss of goodwill or reputational harm; or
(d) any indirect, special, incidental, punitive or consequential loss, in each case whether or not foreseeable and whether or not we were advised of the possibility of such loss.
12.2 Subject always to [[#c-12-4|Clause 12.4]], our aggregate liability to you arising out of or in connection with the Website and these Terms, in respect of all claims in aggregate, shall not exceed the greater of (a) the total amount, if any, paid by you to us in connection with your use of the Website in the twelve (12) months preceding the event giving rise to the claim, and (b) INR 10,000 (Rupees Ten Thousand only). The parties agree this represents a genuine and reasonable pre-estimate and allocation of risk, having regard to the fact that the Website is made available free of charge, that no consideration passes from you to us, and that no engagement or client relationship arises from it.
12.3 You acknowledge that the limitations in this Clause 12 are reasonable having regard to the fact that the Website is provided without charge, that no engagement or client relationship arises from it, and that liability arising from any engagement is separately and specifically addressed in the Engagement Documents.
12.4 Nothing in these Terms operates to exclude or limit our liability for: (a) fraud or fraudulent misrepresentation; (b) death or personal injury caused by our negligence; (c) wilful misconduct or gross negligence; (d) any liability arising under the Digital Personal Data Protection Act, 2023 or other data protection law; (e) any liability which cannot lawfully be excluded or limited; or (f) any statutory liability under the Consumer Protection Act, 2019 where that Act applies to you.
12.5 Each provision of this Clause 12 operates separately. If any part is held to be unenforceable, the remaining parts continue in effect.

## 13 Indemnity
13.1 You shall indemnify and hold harmless Worksmith, its directors, officers, employees and agents from and against all losses, liabilities, damages, claims, proceedings, costs and expenses (including reasonable legal fees) arising out of or in connection with (a) your breach of these Terms; (b) your misuse of the Website; (c) your infringement of any intellectual property or other right of any person; or (d) your violation of any applicable law.
13.2 This indemnity does not apply to the extent that the loss arises from our own fraud, wilful misconduct or gross negligence.

## 14 Force majeure
14.1 We shall not be in breach of these Terms, nor liable for any failure or delay in performance, arising from any cause beyond our reasonable control, including act of God, flood, fire, epidemic or pandemic, war, civil unrest, terrorist action, act of government or regulator, failure of public telecommunications or internet infrastructure, power failure, cyber-attack, or the act or omission of any third-party service provider.

## 15 Suspension and termination
15.1 We may suspend or terminate your access to the Website at any time, without notice and without liability, where we reasonably believe you have breached these Terms or where suspension is necessary to protect the Website, our other users, or our legitimate interests.
15.2 Clauses 3, 6, 7, 9, 11, 12, 13, 16, 17 and 18 survive termination.

## 16 Governing law and jurisdiction
16.1 These Terms, their subject matter and their formation, and any non-contractual obligations arising out of or in connection with them, are governed by and construed in accordance with the laws of India.
16.2 Subject to [[#c-16-3|Clause 16.3]], the courts at Hyderabad, Telangana shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.
16.3 **Arbitration.** Any dispute arising out of or in connection with these Terms which is not resolved by good-faith discussion within thirty (30) days of written notice may be referred by either party to, and shall be finally resolved by, arbitration under the Arbitration and Conciliation Act, 1996. The tribunal shall consist of a sole arbitrator appointed by mutual agreement of the parties; failing agreement within thirty (30) days of a party’s written proposal, the arbitrator shall be appointed on application under Section 11 of that Act. Neither party may unilaterally appoint the arbitrator. The seat and venue of arbitration shall be Hyderabad, Telangana, and the language shall be English. The award shall be final and binding, and each party shall bear its own costs unless the tribunal directs otherwise.
16.4 Nothing in [[#c-16-3|Clause 16.3]] prevents either party from applying to a court of competent jurisdiction for urgent interim or injunctive relief.
16.5 **Consumer rights preserved.** Nothing in this Clause 16 restricts or excludes the right of a person who qualifies as a consumer under the Consumer Protection Act, 2019 to approach the appropriate consumer commission, or requires such a person to arbitrate. Nothing in these Terms limits the time within which either party may enforce its rights, and no provision shall be construed as extinguishing any right on expiry of a period shorter than that allowed by the Limitation Act, 1963.

## 17 Grievance Officer
17.1 Worksmith is not an intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000, and does not host, transmit or store information provided by third parties. Nevertheless, as a matter of good practice, we make available the following point of contact for any grievance concerning the Website or its content:
@grievance
17.2 Grievances will be acknowledged on receipt and we will endeavour to resolve them within thirty (30) days. Grievances concerning personal data are dealt with under [[privacy#s-13|Clause 13 of the Privacy Policy]] and within the period stated there.
17.3 This Clause records a voluntary service commitment. It does not constitute an admission that Worksmith is an intermediary or a significant social media intermediary, and does not attract the obligations applicable to such entities.

## 18 General
18.1 **Entire agreement.** These Terms and the Privacy Policy constitute the entire agreement between you and us in relation to your use of the Website and supersede all prior understandings, save that nothing in this Clause limits liability for fraudulent misrepresentation.
18.2 **Severability.** If any provision is held invalid, illegal or unenforceable, it shall be severed or read down to the minimum extent necessary, and the remaining provisions shall continue in full force.
18.3 **No waiver.** No failure or delay by us in exercising any right operates as a waiver of it.
18.4 **Assignment.** You may not assign or transfer your rights under these Terms. We may assign or transfer ours without your consent, including in connection with a merger, acquisition or sale of assets.
18.5 **No partnership or agency.** Nothing in these Terms creates a partnership, joint venture, agency or employment relationship between you and us.
18.6 **Third-party rights.** A person who is not a party to these Terms has no right to enforce any of them.
18.7 **Language.** These Terms are drawn up in English, which shall be the governing language for all purposes.
18.8 **Notices.** Any legal notice to Worksmith must be in writing and delivered to the registered office at Flat No 207, ND 1, Puppalaguda, Myscape Rd, Gachibowli, Seri Lingampally, K.V. Rangareddy – 500032, Telangana, India, with a copy by email to contact@worksmith.tech. Notice by email alone is not valid service. Any notice to you may be sent to the email address you have supplied to us.
18.9 **Electronic acceptance.** These Terms are an electronic record within the meaning of the Information Technology Act, 2000, generated by a computer system, and do not require any physical or digital signature to be binding.
`;

// ---------- parser: mini-syntax → structured document ----------
export function parseLegal(src) {
  const sections = [];
  let sec = null, clause = null, table = null;
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) { table = null; continue; }
    let m;
    if ((m = line.match(/^## (\d+) (.+)$/))) {
      sec = { n: m[1], title: m[2], id: `s-${m[1]}`, clauses: [] };
      sections.push(sec); clause = null; table = null;
    } else if ((m = line.match(/^(\d+\.\d+) (.+)$/))) {
      clause = { n: m[1], id: `c-${m[1].replace('.', '-')}`, blocks: [{ t: 'p', text: m[2] }] };
      sec.clauses.push(clause); table = null;
    } else if ((m = line.match(/^\(([a-z])\) (.+)$/))) {
      let list = clause.blocks[clause.blocks.length - 1];
      if (list.t !== 'list') { list = { t: 'list', items: [] }; clause.blocks.push(list); }
      list.items.push({ k: m[1], text: m[2] });
    } else if (line.startsWith('|')) {
      const cells = line.slice(1).split(/\|(?![^[]*\]\])/);
      if (!table) { table = { t: 'table', head: cells, rows: [] }; clause.blocks.push(table); } else table.rows.push(cells);
    } else if (line === '@grievance') {
      clause.blocks.push({ t: 'contact' }); table = null;
    } else if (line.startsWith('+ ')) {
      clause.blocks.push({ t: 'p', text: line.slice(2) }); table = null;
    } else {
      throw new Error(`legal.mjs: cannot parse line: ${line.slice(0, 60)}`);
    }
  }
  return sections;
}
