CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  user_id uuid,
  user_email text NOT NULL DEFAULT '',
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_ws_idx ON public.audit_log (workspace_id, created_at DESC);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_admin_read ON public.audit_log FOR SELECT TO authenticated USING (workspace_id = auth.uid() AND public.my_role() = 'admin');

CREATE OR REPLACE FUNCTION public.write_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o jsonb; n jsonb; diff jsonb := '{}'::jsonb; k text;
BEGIN
  IF TG_OP <> 'INSERT' THEN o := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN n := to_jsonb(NEW); END IF;
  IF TG_OP = 'UPDATE' THEN
    FOR k IN SELECT jsonb_object_keys(n) LOOP
      IF o->k IS DISTINCT FROM n->k THEN diff := diff || jsonb_build_object(k, jsonb_build_object('de', o->k, 'para', n->k)); END IF;
    END LOOP;
    IF diff = '{}'::jsonb THEN RETURN NEW; END IF;
  ELSIF TG_OP = 'INSERT' THEN diff := n - 'owner_id';
  ELSE diff := o - 'owner_id'; END IF;
  INSERT INTO public.audit_log (workspace_id, user_id, user_email, table_name, record_id, action, changes)
  VALUES ((coalesce(n,o)->>'owner_id')::uuid, auth.uid(), coalesce(auth.jwt()->>'email',''), TG_TABLE_NAME, (coalesce(n,o)->>'id')::uuid,
    CASE TG_OP WHEN 'INSERT' THEN 'Criação' WHEN 'UPDATE' THEN 'Alteração' ELSE 'Exclusão' END, diff);
  RETURN coalesce(NEW, OLD);
END $$;
REVOKE EXECUTE ON FUNCTION public.write_audit() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_service_orders AFTER INSERT OR UPDATE OR DELETE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_financial_entries AFTER INSERT OR UPDATE OR DELETE ON public.financial_entries FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_bank_accounts AFTER INSERT OR UPDATE OR DELETE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.write_audit();