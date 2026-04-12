
-- Enable RLS but with open policies for demo
ALTER TABLE public.victim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fir ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criminal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_investigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_case ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verdict ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parole ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prison_record ENABLE ROW LEVEL SECURITY;

-- Open policies for all tables (public demo)
CREATE POLICY "Allow all" ON public.victim FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.crime FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.fir FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.investigation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.criminal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.officer FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.officer_investigation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.evidence FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.court_case FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.hearing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.verdict FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.parole FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.prison_record FOR ALL USING (true) WITH CHECK (true);
