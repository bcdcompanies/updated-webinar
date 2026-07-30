# User Guide

This guide describes how hosts and students use the Webinar app in day-to-day operation.

## 1. Roles

- Host: creates webinars, sends invites, starts/ends sessions, moderates participants
- Student: joins through invite link, enters name, attends session

## 2. Host Workflow

## 2.1 Sign In as Host

1. Open the app homepage.
2. If prompted, enter the host key configured on the server.
3. Continue to the dashboard.

If local auth is stale:

- Use Reset local auth on the sign-in form.

## 2.2 Create a Webinar

1. In New webinar, enter title.
2. Add optional description.
3. Set optional scheduled time.
4. Select Create.

Webinar appears in My webinars list with status and invite count.

## 2.3 Open Webinar Details

1. Select webinar title in dashboard.
2. Review:
   - Status
   - Scheduled time
   - Description
   - Invite students section
   - Invited list

## 2.4 Send Invitations

1. Paste emails separated by commas, spaces, or new lines.
2. Select Send invites.
3. Review send results.

Possible outcomes:

- Emailed: invite successfully sent through Resend
- Not emailed: link generated only (email disabled or provider error)

You can still share generated join links manually.

## 2.5 Start and Run Session

1. Select Start session in webinar details.
2. Select Enter room.
3. Approve browser microphone/camera permissions.

Inside room:

- Monitor attendee count.
- Open Manage attendees to moderate students.
- Promote to speak or return to view-only mode.
- Remove participant if needed.

## 2.6 End Session

1. Return to webinar details page if needed.
2. Select End session.
3. Status changes to ended.

## 3. Student Workflow

## 3.1 Join from Invite Link

1. Open invite link.
2. Enter display name.
3. Select Join webinar.

Behavior by session state:

- Scheduled: student can enter name and wait.
- Live: student enters active room.
- Ended: join is blocked.

## 3.2 In-Session Experience

- Students are view-only by default.
- Host may grant speaking permissions.
- Students can leave and rejoin via the same invite link.

## 4. Best Practices for Real Sessions

- Start room 5 to 10 minutes before scheduled time.
- Test host microphone and camera before inviting users in.
- Keep one backup host device signed in.
- Keep a manual copy of join links for fallback sharing.
- Use headphones to reduce echo/feedback.

## 5. Operational Checklists

## 5.1 Pre-Session (Host)

1. Confirm webinar status is scheduled or live.
2. Confirm invite list and links are valid.
3. Confirm LiveKit is reachable.
4. Confirm browser permissions are granted.

## 5.2 During Session

1. Watch attendee panel for joins.
2. Promote only intended speakers.
3. Remove disruptive participants quickly.
4. Keep chat visible for support signals.

## 5.3 Post-Session

1. End session status.
2. Capture operational notes.
3. Record issues for follow-up fixes.
4. Rotate host key if external access was broad.
