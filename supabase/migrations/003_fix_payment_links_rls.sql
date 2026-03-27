-- Fix overly permissive RLS policy on payment_links.
-- The service role client bypasses RLS entirely, so no policy is needed
-- for API access. Removing the open policy closes public anon read/write.

DROP POLICY IF EXISTS "Admins can manage payment links" ON payment_links;

-- Deny all direct client/anon access.
-- All access goes through the service role (bypasses RLS) in API routes.
