-- ============================================================
-- Migration 004 — User-initiated account deletion
-- ============================================================
-- Required by both App Store (guideline 5.1.1(v)) and Google Play
-- (since 2023) for apps that let users create an account: the user
-- must be able to delete their account and personal data from inside
-- the app without having to email support.
--
-- We expose a SECURITY DEFINER function so authenticated clients can
-- delete themselves without the service role key. The function only
-- ever operates on auth.uid(), so a user can never delete anyone else.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Clean up app data first (subscriptions cascade to any future
  -- child tables via their FKs; profiles row, if present, is also
  -- removed here).
  DELETE FROM public.subscriptions WHERE user_id = uid;
  DELETE FROM public.profiles WHERE id = uid;

  -- Finally remove the auth user itself. Supabase handles sessions
  -- and identities via ON DELETE CASCADE on auth.users.
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account TO authenticated;
