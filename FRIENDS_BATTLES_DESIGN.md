# LevelUp10 Friends, Leaderboards and Battles — Proposed Design

V0.24.0 implements the safeguarded Friends and weekly leaderboard foundation described below. Head-to-Head Battles remain a future phase.

## Recommended first release

- Invite-only friends using single-use LevelUp10 friend codes.
- Friends can accept, decline, remove and block connections.
- No public student search, public profiles, direct messaging or location/school disclosure.
- Friends-only weekly leaderboard, opt-in and switchable off by a parent/carer.
- Leaderboard shows display name, avatar and learning points only.
- Asynchronous eight-question Head-to-Head challenges using the same subject, tier and curriculum area for both learners.
- No coin entry fee, gambling-style stake or transferable rewards.

## Safeguarding rules

- Default privacy is private.
- Parent/carer controls social access for linked child accounts.
- Teacher classes do not automatically create friendships.
- Blocking immediately hides both users from each other and prevents new challenges.
- Keep an auditable moderation trail; do not expose email addresses or LevelUp10 account UUIDs.
- Use neutral preset reactions only if reactions are added later; do not add free-text chat in the initial release.

## Supabase architecture

Suggested tables: `friend_invites`, `friendships`, `user_blocks`, `social_preferences`, `battle_challenges`, `battle_participants`, and `battle_results`.

All friendship, blocking, challenge and acceptance actions should use narrowly scoped `SECURITY DEFINER` RPCs. RLS should expose only records involving the signed-in user. Parent controls should be enforced in the RPC as well as the UI.

Leaderboards should be produced by a safe RPC returning only approved public fields. Do not allow broad reads of `profiles` or `student_data`.

## Battle integrity

The first version should be a friendly private challenge without economy rewards. Competitive rewards should wait until question selection and scoring are validated server-side. The server should create the challenge seed/question set, lock the subject/tier/curriculum intersection, accept one result per participant and prevent replay submissions.

## Recommended delivery order

1. Social preferences and parent/carer controls.
2. Friend codes, invitations, accept/decline, remove and block.
3. Friends list and opt-in weekly leaderboard.
4. Asynchronous Head-to-Head challenges without currency rewards.
5. Server-validated scoring, battle history and carefully limited rewards.
