# Scientific Dental Sources & Evidence-Based Guidelines

This reference defines the strict research criteria for the Article Agent (`/article`). All dental and medical statements in generated or updated articles MUST be grounded in verifiable, peer-reviewed scientific literature.

---

## 1. Approved Primary Databases & Journals

When researching topics, the agent must query and prioritize the following peer-reviewed medical and dental publications:

### A. Academic Dental Journals
- **JADA (The Journal of the American Dental Association)**: Comprehensive clinical studies, guidelines, and patient care.
- **Journal of Endodontics (JOE)**: Root canal therapy, pulp biology, dental trauma.
- **Clinical Oral Implants Research (COIR)** & **International Journal of Oral & Maxillofacial Implants (JOMI)**: Dental implantology, bone grafting, sinus lifts, osseointegration.
- **Journal of Clinical Periodontology (JCP)**: Gum disease, periodontitis, gingivitis, soft tissue regeneration.
- **British Dental Journal (BDJ)**: General dental practice, prevention, systemic health connections.
- **American Journal of Orthodontics and Dentofacial Orthopedics (AJO-DO)**: Orthodontic biomechanics, clear aligners, malocclusion.
- **The Journal of Prosthetic Dentistry (JPD)**: Veneers, laminates, crowns, bridges, dentures.
- **Quintessence International & Quintessence Publishing**: Clinical dentistry, aesthetic restorations.

### B. Medical Databases & Systematic Reviews
- **PubMed / MEDLINE (`pubmed.ncbi.nlm.nih.gov`)**: The gold standard database for biomedical research and systematic reviews.
- **Cochrane Oral Health Group (`cochranelibrary.com`)**: Gold-standard evidence-based meta-analyses on dental interventions.
- **ScienceDirect (`sciencedirect.com`)**: Elsevier's scientific repository covering dentistry and oral sciences.

### C. Official Dental Associations & International Health Bodies
- **American Dental Association (ADA) - `ada.org`**: Patient education guidelines, clinical mouth healthy standards, accepted dental materials.
- **FDI World Dental Federation (`fdiworlddental.org`)**: Global oral health policies and preventative recommendations.
- **World Health Organization (WHO) - Oral Health Section**: Global oral disease epidemiology and prevention standards.
- **Iranian Association of Endodontists & Iranian Dental Association (IDA)**: Domestic guidelines and clinical dental protocols in Iran.

---

## 2. Prohibited Sources (STRICTLY BANNED)

The following sources MUST NEVER be used as citations or factual references:
❌ Unverified commercial dental clinic blogs that sell treatments without citations.  
❌ Marketing content mills, affiliate websites, or generic health content farms (e.g. general non-expert blogs).  
❌ User discussion forums, Reddit, Quora, or unmoderated Q&A sites.  
❌ AI-generated unreferenced summaries.  

---

## 3. Targeted Web Search Query Formulas

When using `search_web`, the agent should craft queries using scientific domain operators:

```text
# Example 1: Implant osseointegration & diabetes
query: "dental implant success diabetes site:pubmed.ncbi.nlm.nih.gov OR site:ada.org"

# Example 2: Root canal pain management
query: "post endodontic pain management clinical trial site:ncbi.nlm.nih.gov"

# Example 3: Ceramic laminate vs composite durability
query: "ceramic laminate vs composite veneer longevity clinical study Quintessence OR JADA"

# Example 4: Wisdom tooth extraction recovery
query: "third molar extraction complications recovery guidelines ADA OR Cochrane"
```

---

## 4. Evidence Translation Principles

- **Extracting Clinical Consensus**: Prioritize systematic reviews, meta-analyses, and consensus statements over isolated single-case reports.
- **Statistical Relevance to Patient Realities**: Extract real percentage success rates (e.g., *«میزان موفقیت ایمپلنت در افراد عادی بیش از ۹۵ تا ۹۸ درصد گزارش شده است»*).
- **Contraindications and Safety**: Always check and document medically established contraindications (e.g. uncontrolled HbA1c in diabetes, bisphosphonate medications for bone density, active periodontal infection).
---

## 5. Mandatory Citation Title-to-URL & DOI Verification Protocol

To prevent mismatched links, dead URLs, or AI-hallucinated citations, every citation record added to citations: [...] in rticlesData.ts MUST strictly adhere to this validation procedure:

### A. Title-to-Target Accuracy Requirement
- **Exact Match Required**: The link (url or doi) provided for a citation MUST directly resolve to the exact paper named in 	itle. It is strictly forbidden to pair an article title with a DOI or URL belonging to an unrelated paper or medical topic.
- **Deep-Link Rule**: Avoid generic homepage links (such as https://ada.org or https://jada.ada.org) when specific paper DOIs or PubMed URLs exist. Link directly to the article abstract or full-text (e.g., https://pubmed.ncbi.nlm.nih.gov/<PMID>/ or https://doi.org/<DOI>).

### B. Mandatory Verification Steps Before Writing Citations
1. **Verify Article Title & URL Match**:
   - Query PubMed or CrossRef with the candidate title or PMID/DOI.
   - Confirm that the URL leads to the exact published study bearing that title, authors, and journal.
2. **Fallback / Non-Existent Article Rule**:
   - If an article title or reference does not exist, cannot be verified, or has no functioning direct link/DOI: **DO NOT guess or hallucinate a link**.
   - Instead, search PubMed or Cochrane for an authentic, existing seminal peer-reviewed paper or guideline on the exact same clinical subject, and cite that verified paper with its genuine title, journal, and URL/DOI.
3. **Double-Check Before Git Commit**:
   - Inspect the candidate citations array to ensure 100% of URLs are live, canonical, and accurately titled.
