-- ============================================================
-- Crime and Judiciary Management System — Full SQL Schema
-- Database: PostgreSQL
-- ============================================================

-- 1. VICTIM
CREATE TABLE Victim (
    victim_id   SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    age         INT,
    gender      VARCHAR(10),
    contact     VARCHAR(20),
    address     TEXT
);

-- 2. CRIME
CREATE TABLE Crime (
    crime_id    SERIAL PRIMARY KEY,
    crime_type  VARCHAR(50) NOT NULL,
    description TEXT,
    location    VARCHAR(200),
    crime_date  DATE,
    severity    VARCHAR(20) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical'))
);

-- 3. FIR
CREATE TABLE FIR (
    fir_id      SERIAL PRIMARY KEY,
    crime_id    INT NOT NULL REFERENCES Crime(crime_id) ON DELETE CASCADE,
    fir_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    status      VARCHAR(30) DEFAULT 'Open',
    station_id  INT,
    victim_id   INT NOT NULL REFERENCES Victim(victim_id) ON DELETE CASCADE
);

-- 4. INVESTIGATION
CREATE TABLE Investigation (
    investigation_id SERIAL PRIMARY KEY,
    crime_id         INT NOT NULL REFERENCES Crime(crime_id) ON DELETE CASCADE,
    start_date       DATE,
    end_date         DATE,
    status           VARCHAR(30) DEFAULT 'Ongoing'
);

-- 5. CRIMINAL
CREATE TABLE Criminal (
    criminal_id      SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    dob              DATE,
    gender           VARCHAR(10),
    address          TEXT,
    biometric_hash   VARCHAR(256),
    crime_id         INT REFERENCES Crime(crime_id) ON DELETE SET NULL,
    investigation_id INT REFERENCES Investigation(investigation_id) ON DELETE SET NULL
);

-- 6. OFFICER
CREATE TABLE Officer (
    officer_id  SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    rank        VARCHAR(50),
    station_id  INT,
    contact_no  VARCHAR(20)
);

-- 7. OFFICER_INVESTIGATION (Junction Table — M:N)
CREATE TABLE Officer_Investigation (
    officer_id       INT NOT NULL REFERENCES Officer(officer_id) ON DELETE CASCADE,
    investigation_id INT NOT NULL REFERENCES Investigation(investigation_id) ON DELETE CASCADE,
    PRIMARY KEY (officer_id, investigation_id)
);

-- 8. EVIDENCE
CREATE TABLE Evidence (
    evidence_id     SERIAL PRIMARY KEY,
    fir_id          INT NOT NULL REFERENCES FIR(fir_id) ON DELETE CASCADE,
    type            VARCHAR(50),
    description     TEXT,
    collection_date DATE,
    current_status  VARCHAR(30) DEFAULT 'Collected'
);

-- 9. COURT CASE
CREATE TABLE Court_Case (
    case_id     SERIAL PRIMARY KEY,
    fir_id      INT UNIQUE NOT NULL REFERENCES FIR(fir_id) ON DELETE CASCADE,
    court_name  VARCHAR(100),
    judge_name  VARCHAR(100),
    case_status VARCHAR(30) DEFAULT 'Pending'
);

-- 10. HEARING
CREATE TABLE Hearing (
    hearing_id   SERIAL PRIMARY KEY,
    case_id      INT NOT NULL REFERENCES Court_Case(case_id) ON DELETE CASCADE,
    hearing_date DATE NOT NULL,
    remarks      TEXT
);

-- 11. VERDICT
CREATE TABLE Verdict (
    verdict_id        SERIAL PRIMARY KEY,
    case_id           INT UNIQUE NOT NULL REFERENCES Court_Case(case_id) ON DELETE CASCADE,
    verdict_type      VARCHAR(30) CHECK (verdict_type IN ('Guilty', 'Not Guilty', 'Dismissed', 'Acquitted')),
    verdict_date      DATE,
    sentence_duration VARCHAR(50)
);

-- 12. PAROLE
CREATE TABLE Parole (
    parole_id SERIAL PRIMARY KEY,
    start_date DATE,
    end_date   DATE,
    status     VARCHAR(30) DEFAULT 'Active'
);

-- 13. PRISON RECORD
CREATE TABLE Prison_Record (
    prison_record_id SERIAL PRIMARY KEY,
    criminal_id      INT NOT NULL REFERENCES Criminal(criminal_id) ON DELETE CASCADE,
    prison_name      VARCHAR(100),
    prison_location  VARCHAR(200),
    admission_date   DATE,
    release_date     DATE,
    parole_id        INT REFERENCES Parole(parole_id) ON DELETE SET NULL
);

-- Add FK from Parole back to Prison_Record
ALTER TABLE Parole ADD COLUMN prison_record_id INT REFERENCES Prison_Record(prison_record_id) ON DELETE CASCADE;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_fir_victim ON FIR(victim_id);
CREATE INDEX idx_fir_crime ON FIR(crime_id);
CREATE INDEX idx_evidence_fir ON Evidence(fir_id);
CREATE INDEX idx_hearing_case ON Hearing(case_id);
CREATE INDEX idx_prison_criminal ON Prison_Record(criminal_id);
CREATE INDEX idx_investigation_crime ON Investigation(crime_id);

-- ============================================================
-- 10 COMPLEX SQL QUERIES
-- ============================================================

-- Q1: List all FIRs with victim name and crime type
SELECT f.fir_id, v.name AS victim_name, c.crime_type, f.fir_date, f.status
FROM FIR f
JOIN Victim v ON f.victim_id = v.victim_id
JOIN Crime c ON f.crime_id = c.crime_id;

-- Q2: Get all evidence for a specific FIR
SELECT e.evidence_id, e.type, e.description, e.collection_date, e.current_status
FROM Evidence e
WHERE e.fir_id = 1;

-- Q3: Officers assigned to each investigation with crime details
SELECT o.name AS officer_name, o.rank, i.investigation_id, c.crime_type, i.status
FROM Officer o
JOIN Officer_Investigation oi ON o.officer_id = oi.officer_id
JOIN Investigation i ON oi.investigation_id = i.investigation_id
JOIN Crime c ON i.crime_id = c.crime_id;

-- Q4: Full case lifecycle — from FIR to Verdict
SELECT f.fir_id, v.name AS victim_name, cc.court_name, cc.judge_name,
       vd.verdict_type, vd.sentence_duration
FROM FIR f
JOIN Victim v ON f.victim_id = v.victim_id
JOIN Court_Case cc ON f.fir_id = cc.fir_id
LEFT JOIN Verdict vd ON cc.case_id = vd.case_id;

-- Q5: Criminals currently in prison (no release date yet)
SELECT cr.name, pr.prison_name, pr.admission_date
FROM Criminal cr
JOIN Prison_Record pr ON cr.criminal_id = pr.criminal_id
WHERE pr.release_date IS NULL;

-- Q6: Count of crimes by severity
SELECT severity, COUNT(*) AS total_crimes
FROM Crime
GROUP BY severity
ORDER BY total_crimes DESC;

-- Q7: Hearings scheduled in the next 30 days
SELECT h.hearing_id, cc.court_name, cc.judge_name, h.hearing_date, h.remarks
FROM Hearing h
JOIN Court_Case cc ON h.case_id = cc.case_id
WHERE h.hearing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

-- Q8: Criminals with active parole
SELECT cr.name, p.start_date, p.end_date, p.status
FROM Criminal cr
JOIN Prison_Record pr ON cr.criminal_id = pr.criminal_id
JOIN Parole p ON pr.parole_id = p.parole_id
WHERE p.status = 'Active';

-- Q9: Top 5 officers by number of investigations handled
SELECT o.name, o.rank, COUNT(oi.investigation_id) AS investigations_handled
FROM Officer o
JOIN Officer_Investigation oi ON o.officer_id = oi.officer_id
GROUP BY o.officer_id, o.name, o.rank
ORDER BY investigations_handled DESC
LIMIT 5;

-- Q10: Nested subquery — Victims whose cases resulted in 'Guilty' verdict
SELECT v.name, v.contact
FROM Victim v
WHERE v.victim_id IN (
    SELECT f.victim_id
    FROM FIR f
    JOIN Court_Case cc ON f.fir_id = cc.fir_id
    JOIN Verdict vd ON cc.case_id = vd.case_id
    WHERE vd.verdict_type = 'Guilty'
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Auto-close investigation when end_date is set
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
BEFORE UPDATE ON Investigation
FOR EACH ROW EXECUTE FUNCTION close_investigation();

-- Trigger: Auto-set FIR status to 'Court' when court case is created
CREATE OR REPLACE FUNCTION update_fir_on_court_case()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE FIR SET status = 'In Court' WHERE fir_id = NEW.fir_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fir_court_status
AFTER INSERT ON Court_Case
FOR EACH ROW EXECUTE FUNCTION update_fir_on_court_case();

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure: Register a complete FIR (victim + crime + FIR in one call)
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
    INSERT INTO Victim (name, age, gender, contact, address)
    VALUES (p_victim_name, p_age, p_gender, p_contact, p_address)
    RETURNING victim_id INTO v_victim_id;

    INSERT INTO Crime (crime_type, description, location, crime_date, severity)
    VALUES (p_crime_type, p_description, p_location, p_crime_date, p_severity)
    RETURNING crime_id INTO v_crime_id;

    INSERT INTO FIR (crime_id, fir_date, status, station_id, victim_id)
    VALUES (v_crime_id, CURRENT_DATE, 'Open', p_station_id, v_victim_id);
END;
$$;

-- Procedure: Record a verdict and update case status
CREATE OR REPLACE PROCEDURE record_verdict(
    p_case_id INT, p_verdict_type VARCHAR, p_sentence_duration VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO Verdict (case_id, verdict_type, verdict_date, sentence_duration)
    VALUES (p_case_id, p_verdict_type, CURRENT_DATE, p_sentence_duration);

    UPDATE Court_Case SET case_status = 'Closed' WHERE case_id = p_case_id;
END;
$$;
