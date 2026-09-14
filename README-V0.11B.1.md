# GCSE Boost V0.11B.1 — First Cloud Upload

Adds an explicit, guarded first upload of the currently selected local learner to the signed-in Supabase student account.

Safety rules:
- local progress remains intact
- upload only proceeds when the cloud student_data record is empty
- cloud data never automatically overwrites local data
- upload is read back and verified
- test learner virtual 999999 coin display is not uploaded; only real stored coins are backed up

Automatic two-way sync is intentionally deferred to the next stage.
