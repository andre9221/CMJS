
-- 1. VICTIM
CREATE TABLE public.victim (
    victim_id   SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    age         INT,
    gender      VARCHAR(10),
    contact     VARCHAR(20),
    address     TEXT
);

-- 2. CRIME
CREATE TABLE public.crime (
    crime_id    SERIAL PRIMARY KEY,
    crime_type  VARCHAR(50) NOT NULL,
    description TEXT,
    location    VARCHAR(200),
    crime_date  DATE,
    severity    VARCHAR(20)
);

-- 3. FIR
CREATE TABLE public.fir (
    fir_id      SERIAL PRIMARY KEY,
    crime_id    INT NOT NULL REFERENCES public.crime(crime_id) ON DELETE CASCADE,
    fir_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    status      VARCHAR(30) DEFAULT 'Open',
    station_id  INT,
    victim_id   INT NOT NULL REFERENCES public.victim(victim_id) ON DELETE CASCADE
);

-- 4. INVESTIGATION
CREATE TABLE public.investigation (
    investigation_id SERIAL PRIMARY KEY,
    crime_id         INT NOT NULL REFERENCES public.crime(crime_id) ON DELETE CASCADE,
    start_date       DATE,
    end_date         DATE,
    status           VARCHAR(30) DEFAULT 'Ongoing'
);

-- 5. CRIMINAL
CREATE TABLE public.criminal (
    criminal_id      SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    dob              DATE,
    gender           VARCHAR(10),
    address          TEXT,
    biometric_hash   VARCHAR(256),
    crime_id         INT REFERENCES public.crime(crime_id) ON DELETE SET NULL,
    investigation_id INT REFERENCES public.investigation(investigation_id) ON DELETE SET NULL
);

-- 6. OFFICER
CREATE TABLE public.officer (
    officer_id  SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    rank        VARCHAR(50),
    station_id  INT,
    contact_no  VARCHAR(20)
);

-- 7. OFFICER_INVESTIGATION (Junction Table)
CREATE TABLE public.officer_investigation (
    officer_id       INT NOT NULL REFERENCES public.officer(officer_id) ON DELETE CASCADE,
    investigation_id INT NOT NULL REFERENCES public.investigation(investigation_id) ON DELETE CASCADE,
    PRIMARY KEY (officer_id, investigation_id)
);

-- 8. EVIDENCE
CREATE TABLE public.evidence (
    evidence_id     SERIAL PRIMARY KEY,
    fir_id          INT NOT NULL REFERENCES public.fir(fir_id) ON DELETE CASCADE,
    type            VARCHAR(50),
    description     TEXT,
    collection_date DATE,
    current_status  VARCHAR(30) DEFAULT 'Collected'
);

-- 9. COURT CASE
CREATE TABLE public.court_case (
    case_id     SERIAL PRIMARY KEY,
    fir_id      INT UNIQUE NOT NULL REFERENCES public.fir(fir_id) ON DELETE CASCADE,
    court_name  VARCHAR(100),
    judge_name  VARCHAR(100),
    case_status VARCHAR(30) DEFAULT 'Pending'
);

-- 10. HEARING
CREATE TABLE public.hearing (
    hearing_id   SERIAL PRIMARY KEY,
    case_id      INT NOT NULL REFERENCES public.court_case(case_id) ON DELETE CASCADE,
    hearing_date DATE NOT NULL,
    remarks      TEXT
);

-- 11. VERDICT
CREATE TABLE public.verdict (
    verdict_id        SERIAL PRIMARY KEY,
    case_id           INT UNIQUE NOT NULL REFERENCES public.court_case(case_id) ON DELETE CASCADE,
    verdict_type      VARCHAR(30),
    verdict_date      DATE,
    sentence_duration VARCHAR(50)
);

-- 12. PAROLE
CREATE TABLE public.parole (
    parole_id SERIAL PRIMARY KEY,
    start_date DATE,
    end_date   DATE,
    status     VARCHAR(30) DEFAULT 'Active'
);

-- 13. PRISON RECORD
CREATE TABLE public.prison_record (
    prison_record_id SERIAL PRIMARY KEY,
    criminal_id      INT NOT NULL REFERENCES public.criminal(criminal_id) ON DELETE CASCADE,
    prison_name      VARCHAR(100),
    prison_location  VARCHAR(200),
    admission_date   DATE,
    release_date     DATE,
    parole_id        INT REFERENCES public.parole(parole_id) ON DELETE SET NULL
);

-- Add FK from Parole back to Prison_Record
ALTER TABLE public.parole ADD COLUMN prison_record_id INT REFERENCES public.prison_record(prison_record_id) ON DELETE CASCADE;

-- INDEXES
CREATE INDEX idx_fir_victim ON public.fir(victim_id);
CREATE INDEX idx_fir_crime ON public.fir(crime_id);
CREATE INDEX idx_evidence_fir ON public.evidence(fir_id);
CREATE INDEX idx_hearing_case ON public.hearing(case_id);
CREATE INDEX idx_prison_criminal ON public.prison_record(criminal_id);
CREATE INDEX idx_investigation_crime ON public.investigation(crime_id);

-- Disable RLS for public access (no auth needed for this project)
ALTER TABLE public.victim DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.crime DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fir DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.criminal DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_investigation DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_case DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verdict DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parole DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prison_record DISABLE ROW LEVEL SECURITY;

-- Triggers
CREATE OR REPLACE FUNCTION close_investigation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NOT NULL AND OLD.end_date IS NULL THEN
        NEW.status := 'Closed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_close_investigation
BEFORE UPDATE ON public.investigation
FOR EACH ROW EXECUTE FUNCTION close_investigation();

CREATE OR REPLACE FUNCTION update_fir_on_court_case()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.fir SET status = 'In Court' WHERE fir_id = NEW.fir_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fir_court_status
AFTER INSERT ON public.court_case
FOR EACH ROW EXECUTE FUNCTION update_fir_on_court_case();

-- Stored Procedures
CREATE OR REPLACE PROCEDURE register_fir(
    p_victim_name VARCHAR, p_age INT, p_gender VARCHAR, p_contact VARCHAR, p_address TEXT,
    p_crime_type VARCHAR, p_description TEXT, p_location VARCHAR, p_crime_date DATE, p_severity VARCHAR,
    p_station_id INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_victim_id INT;
    v_crime_id INT;
BEGIN
    INSERT INTO public.victim (name, age, gender, contact, address)
    VALUES (p_victim_name, p_age, p_gender, p_contact, p_address)
    RETURNING victim_id INTO v_victim_id;

    INSERT INTO public.crime (crime_type, description, location, crime_date, severity)
    VALUES (p_crime_type, p_description, p_location, p_crime_date, p_severity)
    RETURNING crime_id INTO v_crime_id;

    INSERT INTO public.fir (crime_id, fir_date, status, station_id, victim_id)
    VALUES (v_crime_id, CURRENT_DATE, 'Open', p_station_id, v_victim_id);
END;
$$;

CREATE OR REPLACE PROCEDURE record_verdict(
    p_case_id INT, p_verdict_type VARCHAR, p_sentence_duration VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.verdict (case_id, verdict_type, verdict_date, sentence_duration)
    VALUES (p_case_id, p_verdict_type, CURRENT_DATE, p_sentence_duration);

    UPDATE public.court_case SET case_status = 'Closed' WHERE case_id = p_case_id;
END;
$$;
