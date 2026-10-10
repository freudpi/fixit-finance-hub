CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL DEFAULT auth.uid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('tecnico','atendente')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX team_members_email_key ON public.team_members (lower(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.my_membership() RETURNS public.team_members
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.team_members
  WHERE user_id = auth.uid() OR (user_id IS NULL AND lower(email) = lower(coalesce(auth.jwt()->>'email','')))
  LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.my_workspace() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce((SELECT m.workspace_id FROM public.my_membership() m WHERE m.id IS NOT NULL), auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.my_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN m.id IS NULL THEN 'admin' WHEN m.active THEN m.role ELSE 'inativo' END
  FROM (SELECT (public.my_membership()).*) m
$$;
CREATE OR REPLACE FUNCTION public.link_membership() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.team_members SET user_id = auth.uid()
  WHERE user_id IS NULL AND lower(email) = lower(coalesce(auth.jwt()->>'email',''))
    AND NOT EXISTS (SELECT 1 FROM public.team_members t WHERE t.user_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.my_membership(), public.my_workspace(), public.my_role(), public.link_membership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_membership(), public.my_workspace(), public.my_role(), public.link_membership() TO authenticated;

CREATE POLICY team_read ON public.team_members FOR SELECT TO authenticated USING (workspace_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY team_admin_insert ON public.team_members FOR INSERT TO authenticated WITH CHECK (workspace_id = auth.uid() AND public.my_role() = 'admin');
CREATE POLICY team_admin_update ON public.team_members FOR UPDATE TO authenticated USING (workspace_id = auth.uid() AND public.my_role() = 'admin') WITH CHECK (workspace_id = auth.uid());
CREATE POLICY team_admin_delete ON public.team_members FOR DELETE TO authenticated USING (workspace_id = auth.uid() AND public.my_role() = 'admin');

ALTER TABLE public.clients ALTER COLUMN owner_id SET DEFAULT public.my_workspace();
ALTER TABLE public.service_orders ALTER COLUMN owner_id SET DEFAULT public.my_workspace();
DROP POLICY IF EXISTS clients_owner ON public.clients;
DROP POLICY IF EXISTS orders_owner ON public.service_orders;
DROP POLICY IF EXISTS finance_owner ON public.financial_entries;
DROP POLICY IF EXISTS banks_owner ON public.bank_accounts;

CREATE POLICY clients_read ON public.clients FOR SELECT TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() IN ('admin','tecnico','atendente'));
CREATE POLICY clients_insert ON public.clients FOR INSERT TO authenticated WITH CHECK (owner_id = public.my_workspace() AND public.my_role() IN ('admin','atendente'));
CREATE POLICY clients_update ON public.clients FOR UPDATE TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() IN ('admin','atendente')) WITH CHECK (owner_id = public.my_workspace());
CREATE POLICY clients_delete ON public.clients FOR DELETE TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() = 'admin');

CREATE POLICY orders_read ON public.service_orders FOR SELECT TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() IN ('admin','tecnico','atendente'));
CREATE POLICY orders_insert ON public.service_orders FOR INSERT TO authenticated WITH CHECK (owner_id = public.my_workspace() AND public.my_role() IN ('admin','atendente') AND (client_id IS NULL OR EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = public.my_workspace())));
CREATE POLICY orders_update ON public.service_orders FOR UPDATE TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() IN ('admin','tecnico','atendente')) WITH CHECK (owner_id = public.my_workspace() AND (client_id IS NULL OR EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.owner_id = public.my_workspace())));
CREATE POLICY orders_delete ON public.service_orders FOR DELETE TO authenticated USING (owner_id = public.my_workspace() AND public.my_role() = 'admin');

CREATE POLICY banks_admin ON public.bank_accounts FOR ALL TO authenticated USING (owner_id = auth.uid() AND public.my_role() = 'admin') WITH CHECK (owner_id = auth.uid() AND public.my_role() = 'admin');
CREATE POLICY finance_admin ON public.financial_entries FOR ALL TO authenticated USING (owner_id = auth.uid() AND public.my_role() = 'admin') WITH CHECK (owner_id = auth.uid() AND public.my_role() = 'admin' AND (bank_account_id IS NULL OR EXISTS (SELECT 1 FROM public.bank_accounts b WHERE b.id = bank_account_id AND b.owner_id = auth.uid())) AND (order_id IS NULL OR EXISTS (SELECT 1 FROM public.service_orders o WHERE o.id = order_id AND o.owner_id = auth.uid())));