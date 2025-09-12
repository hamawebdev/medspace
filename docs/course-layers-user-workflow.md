
# **MedSpace – Suivi Cours pages**


## **Page A – Units & independent modules Directory**

**Route:** `/suivi-cours`

**Layout**

* Title: *La liste de suivi de cours :*
* Grid of **unit or independent modules cards**

**Unit or independent modules Card**

* Icon (illustration per unit)
* Title (unit name)
* Subtitle: “3ème année”
* Counter: number of trackers in this unit

**Actions**

* Click unit or independent module card → go to **Page B** (tracker list for that unit or independent modules ).
* Click `+ CRÉER UN NOUVEAU SUIVI DE COURS` → create tracker (assign it to a unit).

---

## **Page B – Tracker List (within a unit)**

**Layout**

* Title: *La liste de suivi de cours : \[n]* (where n = number of trackers)
* Back button: **↩ Retourner** (to Page A)
* Grid of **tracker cards**

**Tracker Card**

* Tracker title
* Unit name
* "Nombre des Cours" (course count)
* Progress breakdown:

  * C1 (count + %)
  * C2 (count + %)
  * C3 (count + %)
  * CQCM (count + %)
* Created / Modified timestamps
* Button: **Voir la liste des cours** (to open Page C)
* Trash icon: delete tracker

**Actions**

* `Voir la liste des cours` → open **Page C** (tracker detail)
* Trash → delete (with confirmation)
* `+ CRÉER UN NOUVEAU SUIVI DE COURS` → add new tracker to this unit
* ↩ Retourner → back to unit directory (Page A)

---

## **Page C – Tracker Detail (inside a tracker)**


**Layout**

* Header:

  * Unit icon + name
  * Tracker title
  * Back button (↩ Retourner → Page B)

* Progress summary:

  * 4 circular progress charts → Couche 1, Couche 2, Couche 3, Couche QCM
  * Values update dynamically from course checkbox states

* Action button: **Modifier** (edit tracker settings: title, unit, etc.)

* Course list:

  * Accordion-style categories (e.g., *1. Biochimie*)
  * Each course row:

    * Title
    * Four checkboxes: C1, C2, C3, QCM

**Actions**

* Back button → return to tracker list (Page B)
* Modify → edit tracker metadata
* Checkbox toggle → updates course state + progress charts
* Expand/collapse category → show/hide its courses

---

## **Technical Notes**

* **Progress calculation:**

  * % per couche = (checked courses ÷ total courses) × 100.
  * Update charts in real time.
* **Persistence:**

  * Store tracker metadata (title, unit, creation/modification timestamps).
  * Store per-course state (C1/C2/C3/QCM checked).
* **UI interactions:**

  * Confirm before deleting trackers.
  * Dynamic counters update when checkboxes change.

---

✅ This summary contains all necessary components, layouts, and actions to **implement the complete Suivi Cours workflow**:
**Page A (Units) → Page B (Trackers) → Page C (Tracker Detail).**
