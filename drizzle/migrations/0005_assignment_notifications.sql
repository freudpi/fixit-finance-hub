ALTER TABLE public.service_orders ADD COLUMN technician_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL;
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  recipient_email text NOT NULL,
  order_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE,
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_recipient_idx ON public.notifications (lower(recipient_email), created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_read ON public.notifications FOR SELECT TO authenticated USING (lower(recipient_email) = lower(coalesce(auth.jwt()->>'email','')));
CREATE POLICY notif_mark ON public.notifications FOR UPDATE TO authenticated USING (lower(recipient_email) = lower(coalesce(auth.jwt()->>'email',''))) WITH CHECK (lower(recipient_email) = lower(coalesce(auth.jwt()->>'email','')));

CREATE OR REPLACE FUNCTION public.notify_assignment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE nt public.team_members; ot public.team_members; num text := '#' || lpad(NEW.number::text, 4, '0');
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.technician_id IS NOT DISTINCT FROM OLD.technician_id THEN RETURN NEW; END IF;
  IF NEW.technician_id IS NOT NULL THEN
    SELECT * INTO nt FROM public.team_members WHERE id = NEW.technician_id AND workspace_id = NEW.owner_id;
    IF nt.id IS NULL THEN RAISE EXCEPTION 'Técnico inválido'; END IF;
    INSERT INTO public.notifications (workspace_id, recipient_email, order_id, message)
    VALUES (NEW.owner_id, nt.email, NEW.id, 'A OS ' || num || ' (' || NEW.equipment || ') foi atribuída a você.');
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.technician_id IS NOT NULL THEN
    SELECT * INTO ot FROM public.team_members WHERE id = OLD.technician_id;
    IF ot.id IS NOT NULL THEN
      INSERT INTO public.notifications (workspace_id, recipient_email, order_id, message)
      VALUES (NEW.owner_id, ot.email, NEW.id, 'A OS ' || num || ' foi transferida para ' || coalesce(nt.name, 'outro responsável') || '.');
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.notify_assignment() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER service_orders_assignment AFTER INSERT OR UPDATE OF technician_id ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.notify_assignment();