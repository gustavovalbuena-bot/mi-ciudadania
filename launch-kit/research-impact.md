# Mi Ciudadania: Potential impact of a Spanish-first naturalization preparation product

## Abstract
Mi Ciudadania is a proposed low-cost, Spanish-first software guide for lawful permanent residents preparing for U.S. naturalization through Form N-400. The product does not provide legal advice and does not replace attorneys. Its intended role is to reduce informational friction for routine applicants by combining eligibility orientation, process tracking, civics study, and interview practice. This paper reviews the market, evidence base, technical design, risks, and potential impact of the product using public immigration, demographic, and economic research.

## 1. Market context
Naturalization is a large, recurring civic pathway. CRS reports that approximately 25 million foreign-born people in the United States were naturalized citizens in 2023, and that 877,770 people naturalized in FY2023. A separate CRS naturalization policy report, using DHS Office of Homeland Security Statistics estimates, reported about 9.04 million lawful permanent residents potentially eligible to naturalize as of 2023. Mexico represented the largest country-of-birth segment, with about 2.39 million potentially eligible LPRs.

Sources:

- CRS, Citizenship and Immigration Statuses of the U.S. Foreign-Born Population: https://www.congress.gov/crs-product/IF11806
- CRS, U.S. Naturalization Policy: https://www.congress.gov/crs-product/R43366

The Spanish-speaking audience is large and digitally reachable. The Census Bureau's 2023 ACS table C16001 estimates about 43.37 million people age 5 and older in the United States speak Spanish at home, including about 17.60 million who speak English less than “very well.” This does not equal the eligible-to-naturalize market, but it supports the importance of Spanish-language user experience and bilingual study design.

Source: https://data.census.gov/table/ACSDT1Y2023.C16001

## 2. User problem
The routine naturalization applicant faces four linked frictions:

1. Eligibility uncertainty: age, LPR status, 5-year or 3-year basis, residence, physical presence, good moral character, English, civics, and oath readiness.
2. Process uncertainty: documents, filing channel, receipt, biometrics, interview, decision, oath, and post-naturalization tasks.
3. Study friction: the civics test requires memorization under interview conditions, not passive reading.
4. Risk triage: some cases need legal review. Users need to know when not to self-file.

USAGov summarizes basic eligibility requirements, including age 18+, basic English, good moral character, and common residence categories such as 5 years as an LPR or 3 years as an LPR married to a U.S. citizen. USAGov also notes that applicants filing Form N-400 on or after October 20, 2025 take the 2025 civics test and provides 128 questions.

Source: https://www.usa.gov/es/ciudadania-estados-unidos-naturalizacion/

## 3. Cost sensitivity
The filing fee is itself material. CRS reports that the FY2024 fee rule set Form N-400 at $710 online and $760 on paper, including biometric services, with a $380 reduced fee for certain lower-income applicants and possible fee waivers below relevant thresholds. For a household already facing application, translation, travel, time-off-work, and passport costs, a low-cost preparation product can be positioned as a filing-risk reducer rather than a legal substitute.

Source: https://www.congress.gov/crs-product/R43366

## 4. Economic and civic impact evidence
Naturalization has measurable economic and civic associations. Urban Institute research across 21 cities estimated that if eligible immigrants naturalized, their earnings would increase 8.9%, combined earnings in those cities would rise $5.7 billion, and federal/state/city tax revenue would rise $2.0 billion. USC Equity Research Institute's “Citizen Gain” report estimated that citizenship can boost individual earnings by 8% to 11%, with large aggregate gains over ten years.

Sources:

- Urban Institute: https://www.urban.org/research/publication/economic-impact-naturalization-immigrants-and-cities
- USC Equity Research Institute: https://dornsife.usc.edu/eri/publications/citizen-gain/

Language preparation is also economically relevant. Heller and Mumma's randomized evaluation of adult English language training in Massachusetts found that participation doubled voter participation and increased annual earnings by $2,400, with taxpayer returns over time. Mi Ciudadania is not an adult English program, and should not claim equivalent causal effects. However, the study supports a broader thesis: practical language and civic preparation can affect integration outcomes when it reduces real barriers.

Source: https://www.aeaweb.org/articles?id=10.1257/pol.20210336

## 5. Impact logic model
The product should be evaluated through a conservative causal chain:

- Input: Spanish-first guided workflow and study tools.
- Immediate output: completed readiness scan, completed checklist tasks, civics practice volume, interview simulation attempts.
- Intermediate outcome: better understanding of filing timing, fewer abandoned study efforts, higher confidence, earlier identification of legal-risk cases.
- Long-run outcome: more prepared applicants and potentially higher naturalization completion for routine users.

The product should not claim that it directly creates the earnings or tax effects associated with citizenship. It can claim to address process and preparation barriers that sit upstream of successful naturalization.

## 6. Technical product design
The MVP can be implemented as a responsive web app rather than native mobile software. This reduces development cost, enables fast iteration, and serves both phone and desktop users.

Core modules:

- Eligibility orientation engine: deterministic questionnaire with educational outputs and stop-sign flags.
- N-400 process tracker: local or account-based checklist covering documents, filing, biometrics, interview, decision, oath, and post-citizenship steps.
- Civics study engine: bilingual flashcards, keyword hints, section filters, progress counters, and spaced repetition.
- Interview simulator: oral-style prompts, answer reveal, confidence scoring, and practice sessions.
- Legal safety layer: persistent disclaimer, no attorney-client relationship, official-source links, and “talk to a lawyer” triggers.

Data handling:

- MVP should avoid storing sensitive immigration facts on a server unless account storage is required.
- Local-first storage is acceptable for early validation.
- If accounts are added, use encryption in transit, strict access controls, audit logging, and data minimization.
- Avoid collecting A-numbers, full immigration histories, criminal details, tax records, or documents in the earliest MVP unless counsel and security review are complete.

## 7. Legal and ethical boundaries
Mi Ciudadania should be framed as education and workflow software. The product must not:

- Tell a user that they are legally eligible with certainty.
- Select legal strategy for complex cases.
- Complete or submit forms as a representative.
- Interpret criminal, tax, or immigration history beyond generic risk warnings.
- Imply government affiliation.

The app should clearly recommend attorney review for risk factors such as arrests, prior removal orders, long trips, tax issues, child support issues, Selective Service concerns, misrepresentation, conditional residence issues, or inconsistent immigration history.

## 8. Business model fit
The first business model should test willingness to pay, not venture scale:

- Free landing page and sample diagnostic.
- One-time 90-day paid guide in the $29-$49 range.
- Optional low-cost interview practice pack.
- Attorney or nonprofit partner license for education and lead qualification.

The product should avoid referral fee structures that could create legal ethics risk. A safer early partner model is software subscription, sponsorship, or co-branded education access reviewed by counsel.

## 9. MVP evaluation design
A practical launch experiment should measure:

- Visitor-to-scan conversion.
- Scan completion rate.
- Paid conversion after scan.
- Percentage of users flagged for attorney review.
- Study activation: first 20 civics cards completed.
- Roadmap activation: first three N-400 tasks checked.
- Interview activation: at least one simulation completed.
- Self-reported confidence before and after use.
- Refund/support requests and legal-boundary confusion.

Suggested benchmark for a viable paid test:

- 100-300 paid users acquired from 2-3 local markets.
- Paid conversion above 4% from completed scan.
- CAC below gross first-payment margin.
- At least 50% of paid users complete one meaningful study or roadmap action in week one.

## 10. Conclusion
Mi Ciudadania's best initial opportunity is not a broad legal-tech platform. It is a narrow, trusted, Spanish-first preparation layer for routine naturalization applicants. The product can create value by reducing uncertainty, organizing the process, improving study behavior, and routing complex users toward attorneys. The strongest next step is a small paid MVP launch with explicit legal boundaries, official-source transparency, and measurable activation.
