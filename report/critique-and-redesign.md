# Visualization Critique and Redesign Report

**Course:** STATS 401
**Project:** Individual Project — Visualization Critique and Redesign
**Selected Visualization:** CalCORVID (California Clustering for Operational Real-time Visualization of Infectious Diseases)

---

## 1. Original Visualization and Context

**Source:** California Department of Public Health (CDPH) Modeling Team.
Published in CSTE Stories from the Field and *BMC Public Health*.
GitHub: https://github.com/cdphmodeling/CalCORVID

**Data:** COVID-19 test positivity data aggregated to census tract level in California, integrated with the CDC/ATSDR Social Vulnerability Index (SVI). The example dataset used here (`CAtest_combgiscol_fnl.csv`) contains eight SaTScan-detected clusters from January 2024.

**Intended message:** The dashboard communicates whether statistically significant spatiotemporal clusters of COVID-19 positivity exist in California, where they are located, how long they span, and what social vulnerability context characterizes them.

**Audience:** State and local public health epidemiologists.

**Tasks:** Locate clusters on a map, compare their size and time span, contextualize them using SVI tooltips, and track their evolution over time.

---

## 2. Critique

### Strengths

**Strength 1: Translates technical statistical output into an interactive spatial tool.**
SaTScan natively produces text-based results (log likelihood ratios, p-values, relative risks). CalCORVID spatializes these through Leaflet maps and linked tables, reducing the barrier to interpretation.

**Strength 2: Integrates the Social Vulnerability Index.**
Unlike other SaTScan visualization tools, CalCORVID overlays SVI data, allowing epidemiologists to identify not only where disease is concentrated but also which populations are more vulnerable.

### Weaknesses

**Weakness 1: Circular scan windows mislead users about true cluster shape.**
SaTScan defaults to circular scan windows. Circular windows tend to absorb nearby no-risk areas, producing a "most likely cluster" larger than the true elevated-risk region. Rendering these as circular overlays implies "boundary = true risk boundary," which is statistically inaccurate. **Improvement:** Use census-tract-level proportional circles sized by O/E ratio, so users can see cluster location and magnitude without misinterpreting the detection window.

**Weakness 2: Randomly assigned cluster colors carry no data meaning.**
Colors are randomly selected to distinguish clusters, not to encode any data attribute. This prevents color-based ranking and does not guarantee color-vision accessibility. **Improvement:** Use a sequential color scheme bound to recurrence interval.

**Weakness 3: Statistical uncertainty is hidden in tooltips.**
p-values, relative risks, and recurrence intervals are only visible on hover. Users cannot rapidly scan multiple clusters to prioritize investigation. **Improvement:** Encode statistical significance through visual channels such as opacity and numeric labels.

---

## 3. Redesign Rationale

**Decision 1: Proportional circles over a clean background.**
Instead of circular scan overlays, the redesign places proportional circles at cluster centroids, sized by O/E ratio. This addresses Weakness 1 by removing the misleading "boundary = risk boundary" implication.

**Decision 2: Sequential color scheme encodes recurrence interval.**
Random colors are replaced by a YlOrRd sequential scale mapped to recurrence interval. This addresses Weakness 2 by binding color to a meaningful data attribute.

**Decision 3: Opacity encodes statistical strength.**
Opacity maps inversely to recurrence interval, so stronger evidence appears more opaque. O/E ratios are shown as numeric labels. This addresses Weakness 3 by supporting pre-attentive processing and rapid prioritization.

---

## 4. Original vs. Redesign

The redesign makes it easier to (1) scan all clusters for statistical strength, (2) compare O/E ratios directly, and (3) prioritize which clusters warrant investigation.

**Trade-offs:** The redesign loses the "cluster as a single entity" visual grouping provided by circular overlays. It also requires tract-level centroid coordinates, which the original dashboard's circular overlays do not.

**Limitations:** The redesign uses cluster centroids rather than full tract polygons, so it still does not show within-cluster heterogeneity at the tract level.

---

## 5. Figures and References

**Figure 1.** Original CalCORVID dashboard screenshot.
**Figure 2.** Redesigned D3.js visualization.

**References:**

1. Lu P, León T. CalCORVID. CSTE Stories from the Field.
2. Lu P, Jain S, León TM, White LA. CalCORVID. *BMC Public Health*, 2026.
3. CalCORVID GitHub: https://github.com/cdphmodeling/CalCORVID
4. Wang L, et al. *Frontiers in Public Health*, 2025;12:1432645.
5. Tango T. *Statistical Methods in Medical Research*, 2021;30(1):75-86.
6. Chen T, et al. *Cartography and Geographic Information Science*, 2025;52(6):650.