# Expo React Native mobile implementation plan

## Feature map

Authentication → guardian consent → child selector/profile editor → four-level learning map → stage/lesson → exercise → recording → animated scoring → immediate comparison → next exercise. Guardian area: best result details, progress, counts, sound-practice summary, daily activity, badges, child delete/restore and sign-out.

Use TypeScript strict mode, generated API models/client wrappers, server-state query/cache layer, dedicated auth/session adapter and localization catalog. Do not bind screens directly to raw fetch calls or duplicate backend progression rules. Specific package versions are selected and locked during phase 01, with Expo compatibility verified then.

## Screen contract mapping

| Screen/action | API |
| --- | --- |
| Identity/consent | GET /api/v1/me; PUT /api/v1/me/consent |
| Profiles | /api/v1/children and /{child_id}; avatars list |
| Lesson browsing | GET /api/v1/catalog; GET /api/v1/media/{media_id} |
| Learning map | GET /api/v1/children/{child_id}/progress |
| Recording | POST child/exercise evaluate multipart |
| Guardian home | GET child dashboard; current progress/best |
| Recovery | List include_deleted=true; POST child restore |

Backend URLs are environment-specific private HTTPS origins. Physical phone/tablet must join authorized Tailscale network; localhost on phone means the phone, not the developer's machine. Firebase still requires network connectivity for sign-in/token refresh.

## Audio state machine

idle → permission request → recording → uploading/scoring → result or recoverable error → idle. Every exit stops recorder and disposes file handles. Navigation, app background/interruption, rejected permissions, sign-out, profile deletion and request failure need explicit handling. Do not keep an upload queue. If O01 adds limits, agree child-friendly wording before implementation; no cap has yet been approved.

Capture format must be confirmed with real Android devices and later iOS. Do not transcode large audio synchronously on the UI thread. Show waiting timeout without claiming a lost response means no backend commit. Refresh progress after ambiguous connectivity errors.

## Comparison and rewards

Show current score/feedback alongside previous compatible best; first attempt gets no “improvement from zero.” Result screen data is transient. Read retained best from progress after leaving screen. Backend determines pass, stars, badges and next exercise. Do not save per-attempt analytics containing scores. Use gentle encouragement for lower scores and neutral retry wording for service failures.

## Bilingual and adaptive design

Ship all primary/error/permission/empty/loading/guardian screens in Arabic and English. Prefer logical start/end spacing, mirror navigation where appropriate, preserve Arabic diacritic rendering and test mixed-direction numbers/phonemes. Phone layout is single-pane; tablet can show lesson list/detail without stretching content excessively. Screen-reader labels and large accessible controls should be tested, not assumed from visuals.

## Cache policy

Persist active catalog/reference media with version/digest, not temporary recordings or losing results. Partition best/progress by guardian and child. Stale catalog is browse-only until online revision check. Clear private caches on sign-out/delete. A missing cached media asset has an explicit placeholder/download-needed state. Storage eviction must not break UI.

## Test targets

Google and email/password paths; expired token; account switch; wrong profile protection; consent absent; microphone denied; audio interruption; offline launch; stale catalog; mock/real labeling; first/lower/higher/equal results; timeout then progress reconciliation; RTL/LTR on phone/tablet. Android is the first release gate; iOS requires separate signing/device/audio validation later.
