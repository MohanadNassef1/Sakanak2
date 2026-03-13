

## Plan: Add count badges to Chat and Viewings icons in Navbar

The chat icon already has an unread message badge. The task is to add a pending/actionable viewings count badge to the Eye (My Viewings) icon in both desktop and mobile navigation.

### What counts as "actionable" viewings
Viewing requests where the current user needs to take action:
- **As landlord**: status = `pending` (needs to accept/decline/counter)
- **As tenant**: status = `counter_proposed` (needs to accept/decline the counter)

### Changes

**1. Create `src/hooks/useUnreadViewings.ts`**
- Query `viewing_requests` for actionable counts based on user role in each request
- Subscribe to realtime changes on `viewing_requests` table for instant updates
- Return the count number

**2. Update `src/components/Navbar.tsx`**
- Import and use `useUnreadViewings`
- Add badge to the desktop Eye icon (same style as chat badge)
- Add badge to the mobile Eye icon + count pill on the right side (same pattern as mobile chat link)

No database changes needed — this reads existing `viewing_requests` data with existing RLS policies.

