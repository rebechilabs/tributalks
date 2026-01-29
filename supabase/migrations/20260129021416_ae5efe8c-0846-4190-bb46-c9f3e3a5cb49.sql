-- Create organization_seats table to manage multi-user access
CREATE TABLE public.organization_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, member_email)
);

-- Enable RLS
ALTER TABLE public.organization_seats ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is seat owner
CREATE OR REPLACE FUNCTION public.is_seat_owner(_user_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = _owner_id
$$;

-- Security definer function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_seats
    WHERE owner_id = _owner_id
      AND member_user_id = _user_id
      AND status = 'active'
  )
$$;

-- RLS Policies
-- Owners can view all their seats
CREATE POLICY "Owners can view all seats"
ON public.organization_seats
FOR SELECT
USING (auth.uid() = owner_id);

-- Members can view seats where they are invited
CREATE POLICY "Members can view their invitations"
ON public.organization_seats
FOR SELECT
USING (member_user_id = auth.uid() OR member_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Owners can insert new seats
CREATE POLICY "Owners can invite members"
ON public.organization_seats
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their seats
CREATE POLICY "Owners can update seats"
ON public.organization_seats
FOR UPDATE
USING (auth.uid() = owner_id);

-- Members can accept their own invitation
CREATE POLICY "Members can accept invitation"
ON public.organization_seats
FOR UPDATE
USING (
  member_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
);

-- Owners can delete seats
CREATE POLICY "Owners can delete seats"
ON public.organization_seats
FOR DELETE
USING (auth.uid() = owner_id);

-- Add seat limits to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS max_seats integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS extra_seats_purchased integer DEFAULT 0;

-- Create index for performance
CREATE INDEX idx_org_seats_owner ON public.organization_seats(owner_id);
CREATE INDEX idx_org_seats_member ON public.organization_seats(member_user_id);
CREATE INDEX idx_org_seats_email ON public.organization_seats(member_email);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_org_seats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_seats_updated_at
BEFORE UPDATE ON public.organization_seats
FOR EACH ROW
EXECUTE FUNCTION public.update_org_seats_updated_at();