-- Manually confirm samuelz@hitssolutions.com (did not receive confirmation email)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email = 'samuelz@hitssolutions.com';
