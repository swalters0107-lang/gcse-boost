# GCSE Boost V0.11B.2.1 — Cloud Load Repair

- Repairs signed-in startup cloud loading.
- Reads the full `student_data` row so older/variant schemas do not break the load query.
- Applies cloud state before continuing with the signed-in learner.
- Cloud Account now reports the real load result instead of a hard-coded success message.
- Existing V0.11A.29.2 Home/Recovery repair is preserved.
- Local storage remains the offline fallback.
