# Sakanak Home Connect

website In english,arabic

You are a senior full-stack architect, system designer, and product manager.

You are helping me build a REAL startup for the Egyptian market.
This is NOT a university project, NOT a demo, and NOT a prototype.

You must make production-ready decisions, scalable architecture, and clean UX.

Do NOT simplify. Do NOT cut features. Do NOT use fake logic.

----------------------------------
📌 PRODUCT NAME
----------------------------------
Sakanak — Roommate & Room Listing Platform for Egypt

----------------------------------
🎯 PRODUCT VISION
----------------------------------
Sakanak helps people in Egypt:

- Find rooms
- Find compatible roommates
- Connect only with VERIFIED users
- Avoid brokers and scams

Core values:
- Trust
- Safety
- Privacy
- Gender protection
- Clean modern experience

----------------------------------
🖼️ OFFICIAL BRAND ASSETS & UI REFERENCE
----------------------------------

The following provided images are the official visual reference for Sakanak.

You MUST use them as the main design guideline:

1) Logo
2) Header / Hero Section Layout
3) User Reviews / Testimonials Design

Rules:

- Replicate the same visual style, layout, spacing, and hierarchy.
- Use the same logo positioning and sizing.
- Follow the same header structure:
  - Left: Text + CTA buttons
  - Right: Room image card
- Follow the same reviews layout:
  - 3 cards
  - Star rating
  - User initials avatars
  - City labels

Color Usage:

- Main orange tone must match the reference images.
- Background must stay light/neutral.
- No random gradients.
- No blue/purple themes.

Typography:

- Headline style similar to reference.
- Bold keywords in orange.
- Clean modern font.

Hero Section Rules:

- Large headline
- Highlighted keywords in orange
- Two CTAs:
  - Find a Room
  - List Your Room
- Trust badges under CTAs

Brand Consistency:

- All pages must follow this visual language.
- No redesigning.
- No changing layout direction.

The reference images are the official design system.
They override generic UI decisions.
No exceptions.

----------------------------------
🎨 BRAND COLORS & UI SYSTEM
----------------------------------

Primary Color:
- Orange: #FF7A00 (Main Brand Color)

Secondary Colors:
- Dark Gray: #1F2933
- Light Gray: #F5F7FA
- White: #FFFFFF

Accent Colors:
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

Usage Rules:

- Orange must be used for:
  - Primary buttons
  - CTAs
  - Active states
  - Highlights
  - Icons
  - Links

- No blue, purple, or random colors allowed.
- Maintain color consistency across all pages.

Typography:
- Font: Inter / Poppins (or closest web-safe alternative)
- Consistent sizes and weights.

Design Tokens:
- Use CSS variables for colors.
- Centralized theme file.

Dark Mode (Optional):
- Optional future-ready support.
----------------------------------
👤 USER TYPES
----------------------------------
Two main intents:

1) Looking for a room
2) Has an empty room

Selected clearly from Home Page.

----------------------------------
🔐 AUTHENTICATION & CORE RULES
----------------------------------

Register:
- Full name
- Email
- Password
- Gender (Male / Female) → REQUIRED

Rules:
- Gender saved permanently
- Cannot be edited
- Used for filtering

Auth:
- JWT + Refresh tokens

----------------------------------
🧠 SMART MATCHING SYSTEM
----------------------------------

The platform must implement a smart matching system.

Goal:
Help seekers find the most compatible roommates and rooms.

Matching Factors:
- Gender (mandatory filter)
- Smoking status
- Pets
- Occupation
- Budget range
- Location preference
- Lifestyle preferences
- Description keywords

System Behavior:

1) Analyze user profile and preferences.
2) Score rooms and roommates.
3) Rank results by compatibility.
4) Show “Best Match” badge.
5) Display match percentage (e.g. 87% compatible).

Technical Rules:
- Matching logic must be modular.
- AI-ready architecture.
- Upgradeable to ML later.
- No hardcoding.

UX:
- “Recommended for You” section.
- Smart filters.
- Explanation tooltip: “Why this match?”

Admin:
- Adjust scoring weights.

----------------------------------
🌟 PREMIUM LISTINGS (FEATURED ADS)
----------------------------------

The platform must support paid featured listings.

Goal:
Allow owners to promote their rooms.

Features:

1) Featured Placement:
- Home page top section
- Search results top
- Category spotlight

2) Highlight Design:
- Special border
- “Featured” badge
- Glow / shadow effect

3) Pricing Model (Configurable):
- Daily / Weekly / Monthly
- Example:
  - 20 EGP / day
  - 100 EGP / week
  - 300 EGP / month

4) Duration System:
- Auto-expire after period
- Renewal option

5) Payment Integration:
- Use platform payment system
- Invoice generated

Backend:
- Priority ranking logic
- Expiration scheduler

Admin:
- Approve / reject featured ads
- Change pricing
- View revenue analytics

----------------------------------
🚀 BOOST LISTING SYSTEM
----------------------------------

The platform must implement a boost feature.

Goal:
Give instant visibility to listings.

Boost Behavior:

1) Owner clicks “Boost Listing”.
2) Pays small fee.
3) Listing moves to top for limited time.

Example:
- 24 hours boost = 25 EGP
- 48 hours boost = 40 EGP

Rules:
- Cannot stack unlimited boosts.
- Cooldown between boosts.
- Fair ranking algorithm.

Visual:
- “Boosted” badge
- Countdown timer

Backend:
- Temporary ranking override
- Auto-reset system

Admin:
- Configure pricing
- Monitor abuse
----------------------------------
👥 ROOMMATE DISCOVERY SYSTEM
----------------------------------

The platform must support searching for PEOPLE, not only rooms.

Search Modes:

1) Find a Room
   → Browse room listings

2) Find a Roommate
   → Browse user profiles

Users must select their search intent:
- Looking for a room
- Looking for a roommate
- Both

Roommate Profiles Display:

Each profile shows:
- Photo
- First name
- Age range
- City
- Budget range
- Lifestyle info (smoker, pets, work)
- About section
- Compatibility score

Rules:
- Only verified users appear in roommate search
- Gender filtering applies
- No contact info before payment

Matching Integration:
- Smart Matching applies to both rooms and people

UX:
- Dedicated “Find Roommate” page
- Separate filters
- Clear navigation

Database:
- user.searchIntent field
- roommatePreferences object

APIs:
/api/roommates/search
/api/roommates/recommend

No shortcuts.
Must be fully implemented.
----------------------------------
📱 EMAIL & PHONE VERIFICATION (MANDATORY)
----------------------------------

Before completing profile, user must:

- Verify email (OTP / link)
- Verify phone number (SMS OTP)

Profile cannot be activated until both are verified.

----------------------------------
🧍 USER PROFILE (MANDATORY)
----------------------------------

After signup + verification:

- WhatsApp number
- Nationality
- ID / Passport uploads
- Occupation
- Smoker
- Has pets (Yes/No)
  - If Yes → Must specify pet type
- About Me
- What I’m Looking For

Privacy:
- Phone + Email hidden
- Admin only access

----------------------------------
✅ ID & PASSPORT VERIFICATION SYSTEM
----------------------------------

User status:
- unverified
- pending
- verified
- rejected

Admin reviews documents.

After approval:
- Verified badge appears everywhere
- Profile unlocked

Only verified users can:
- Chat
- Reserve
- Pay
- Contact owners

----------------------------------
🏠 ROOM LISTINGS
----------------------------------

Room fields:
- Title
- City
- Price
- Description
- Images
- Gender
- Availability

----------------------------------
📄 ROOM DETAILS PAGE (REQUIRED)
----------------------------------

Each room has a dedicated page:

Displays:
- Gallery
- Owner profile
- Verification badge
- Price breakdown
- Rules
- Chat / Reserve buttons

----------------------------------
🚨 STRICT GENDER FILTERING
----------------------------------

No gender selection on Home page.

Auto-filter using user.gender.

Backend + Frontend enforced.

----------------------------------
🔎 SEARCH & FILTERING
----------------------------------

Filters:
- City
- Budget range

Gender → automatic
----------------------------------
🚫 ANTI-BYPASS & OFF-PLATFORM PAYMENT PREVENTION
----------------------------------

The platform must actively prevent users from completing deals outside Sakanak.

Core Rules:

1) No contact info is visible before payment:
   - No phone numbers
   - No WhatsApp
   - No email
   - No address
   - No social media links

2) Built-in chat only:
   - All communication must happen inside the platform.
   - External messaging is discouraged.

3) Smart chat filtering:
   - Automatically detect and block:
     - Phone numbers
     - WhatsApp links
     - Social media usernames
     - URLs
   - Replace blocked content with warning message.

4) Locked contact details:
   - Contact info is unlocked ONLY after successful payment.
   - Payment status must be "released".

5) Payment-gated access:
   - Location, visit details, and owner contact are hidden until payment.

6) Trust & Protection Badge:
   - Display “Protected by Sakanak” badge on paid bookings.
   - Inform users that payments outside platform are not protected.

7) Violation monitoring:
   - Detect suspicious behavior:
     - Long chats without payment
     - Sudden inactivity
     - Repeated cancellations

8) Penalty system:
   - Warning → Temporary ban → Permanent ban
   - Violations logged in admin dashboard.

9) Terms enforcement:
   - Clear policy:
     - Off-platform payments are forbidden.
     - Violators may lose access permanently.

Backend Implementation:

- Chat message filtering middleware
- Contact unlocking logic linked to Payment status
- Behavior analytics service
- Admin review panel

UX Requirements:

- Clear message:
  "To protect your money, keep all payments inside Sakanak."
- Payment CTA always visible during chat.

This system must be implemented both technically and in UX.
No exceptions.

----------------------------------
🎁 REWARDS & LOYALTY SYSTEM
----------------------------------

The platform must implement a full loyalty and rewards system.

Goals:
- Increase user retention
- Encourage repeat usage
- Reduce off-platform payments
- Build long-term trust

Discount Rules:

1) First booking:
   - Platform commission = 5%

2) Returning user (2nd booking and above):
   - Platform commission = 2.5%

3) Admin-controlled campaigns:
   - Admin can create custom discounts
   - Percentage-based or fixed amount
   - Time-limited offers
   - User-specific offers

Examples:
- "Welcome Back: 50% off commission"
- "Ramadan Offer: 2.5% Commission"
- "Top User Reward"

Eligibility:
- Based on completed successful payments
- Not refunded
- Not canceled

Technical Rules:

- Discount rules must be dynamic
- No hardcoding
- Configurable from admin panel
- Stored in database

Notification System:

The platform must support admin-created notifications.

Admin can send:
- Promotional messages
- Discount alerts
- System updates
- Personalized offers

Channels:
- In-app notifications
- Email
- SMS (optional)

Features:
- Read/unread status
- Scheduling
- Targeted users
- Analytics

Backend:

Create:
- RewardService
- DiscountEngine
- NotificationService

Database Models:
- Reward
- Coupon
- Campaign
- Notification
- UserRewardHistory

UX Requirements:

- Display active discounts in dashboard
- Show savings in payment breakdown
- Highlight rewards visually
- Clear expiration date

Admin Panel:

Admin can:
- Create / edit / delete campaigns
- Assign users
- Track usage
- Measure ROI

No shortcuts.
Must be scalable.

----------------------------------
👥 REFERRAL & INVITE SYSTEM
----------------------------------

The platform must implement a referral and invite system.

Goals:
- Organic user growth
- Reduce marketing costs
- Increase trusted users
- Encourage quality users

Referral Rules:

1) Each user gets a unique referral code and referral link.

Example:
- Code: SAK123AB
- Link: sakanak.com/invite/SAK123AB

2) New users must enter referral code during signup
   or use referral link.

3) Rewards are granted ONLY after:
   - Referred user completes profile
   - Passes verification
   - Completes first successful payment

4) Reward Model:

Option A (Default):
- Referrer gets 50% off commission on next booking
- Referred user gets 25% off commission on first booking

Option B (Admin configurable):
- Fixed discount
- Wallet credit
- Cashback

5) Abuse Prevention:

- No self-referrals
- No fake accounts
- IP/device fingerprinting
- Manual admin review for suspicious activity

6) Expiration Rules:

- Referral rewards expire after configurable period
  (e.g., 90 days)

Technical Implementation:

- Generate unique referral codes
- Track referral chains
- Prevent duplication
- Store reward history

Database Models:
- Referral
- ReferralReward
- InviteLog

Notification System:

- Notify user when:
  - Friend joins
  - Friend gets verified
  - Reward is unlocked
  - Reward is used

Admin Panel:

Admin can:
- Change reward rules
- Pause system
- Audit abuse
- View referral analytics

UX Requirements:

- Referral section in dashboard
- Share buttons (WhatsApp, Facebook, Copy link)
- Clear reward progress bar

No shortcuts.
Must be scalable and secure.

----------------------------------
💬 REAL-TIME CHAT SYSTEM
----------------------------------

Seeker ↔ Owner ↔ Roommates

Use Socket.io.

Features:
- Read status
- Block/report
- File sharing

Verified users only.

----------------------------------
Payment methods:
- Fawry
- InstaPay
- Vodafone Cash

Business model:
Platform commission = 5%

Payment flow (Escrow-style):

1) Seeker pays the FULL amount to the platform first.
2) Platform holds the money temporarily.
3) Platform takes 5% commission.
4) Platform sends the remaining amount to the room owner.

Example:
Room price = 3000 EGP
Commission (5%) = 150 EGP
Total paid by seeker = 3150 EGP

Platform receives = 3150 EGP
Platform keeps = 150 EGP
Owner receives = 3000 EGP

Rules:
- All payments go to platform account first.
- No direct payment between users.
- Payouts handled by admin system.
- All transactions logged.
- Refund & dispute system required.
----------------------------------
🎨 DESIGN & BRANDING
----------------------------------

Primary: Orange

Style:
- Rounded
- Soft shadows
- Airbnb-like

Hero + CTA.

----------------------------------
🧭 DASHBOARD
----------------------------------

User:
- Status
- Profile
- Listings
- Chat
- Payments

Admin:
- Verifications
- Revenue
- Reports
- Disputes

----------------------------------
🏗️ TECH STACK
----------------------------------

Frontend:
- React
- Vite
- Tailwind
- Axios
- Socket.io-client

Backend:
- Node.js
- Express
- MongoDB
- JWT
- Multer
- Socket.io

----------------------------------
📦 DATABASE DESIGN (MANDATORY)
----------------------------------

Use MongoDB + Mongoose.

Schemas:

User
- name
- email
- phone
- password
- gender (immutable)
- verificationStatus
- emailVerified
- phoneVerified
- role
- timestamps

Profile
- userId (ref)
- nationality
- documents
- occupation
- smoker
- pets
- about
- lookingFor

Room
- ownerId
- title
- city
- price
- gender
- images
- status

Chat
- participants
- lastMessage

Message
- chatId
- sender
- content
- type

Payment
- payerId
- ownerId
- roomId
- amount
- commission
- method
- status
- referenceId

AdminAction
- adminId
- target
- action
- reason

Use indexes + validation.

----------------------------------
🛠️ BACKEND SYSTEM DESIGN
----------------------------------

Architecture:

Routes → Controllers → Services → Repositories → Models

Structure:

/src
 /config
 /models
 /controllers
 /services
 /middlewares
 /routes
 /utils
 /sockets

Rules:
- No logic in routes
- Central error handler
- Logging
- Rate limiting
- Secure env
- Validation

Security:
- Helmet
- Bcrypt
- CORS
- JWT rotation
- Sanitization

----------------------------------
🧱 LAYOUT RULES
----------------------------------

MainLayout:
- Navbar
- Outlet
- Footer

No 100vh / h-screen.

----------------------------------
🔑 API RULES
----------------------------------

/api/auth
/api/profile
/api/listings
/api/chat
/api/payments
/api/admin

JWT protected.

----------------------------------
🚫 CONSTRAINTS
----------------------------------

No:
- Fake logic
- Hardcoding
- Dummy data
- Shortcuts

Only:
- Best practices
- Clean code
- Scalable design

----------------------------------
📋 DELIVERABLES
----------------------------------

Provide:

- Architecture diagram
- DB schema
- APIs
- Full code
- Admin panel
- Deployment guide

----------------------------------
🧠 WORKFLOW
----------------------------------

1) Architecture
2) DB
3) APIs
4) Backend
5) Frontend
6) Chat
7) Payments
8) Admin
9) Testing
10) Deploy

DO NOT SKIP STEPS.


----------------------------------
📜 LEGAL, MONITORING & RELIABILITY
----------------------------------

- Implement Terms & Conditions
- Privacy Policy
- Refund Policy
- User Agreement

- Error monitoring (Sentry-style)
- Payment failure alerts
- Fraud detection alerts

- Daily database backups
- Disaster recovery plan
- Restore procedures

- API versioning
- Migration system
- Update strategy

----------------------------------
FINAL RULE
----------------------------------

Think like a CTO.
Build like a startup.
No shortcuts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sakanak.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/075b3489-daa0-4b32-ba8c-8ea0a6df1c8c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
