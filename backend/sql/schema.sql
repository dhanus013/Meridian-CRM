-- Meridian CRM — MySQL schema (AWS RDS)
-- Run this against your RDS MySQL instance:
--   mysql -h <rds-endpoint> -u <user> -p < schema.sql

CREATE DATABASE IF NOT EXISTS meridian_crm;
USE meridian_crm;

CREATE TABLE IF NOT EXISTS companies (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  industry    VARCHAR(100),
  website     VARCHAR(255),
  phone       VARCHAR(30),
  address     VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_name (name)
);

CREATE TABLE IF NOT EXISTS contacts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  company_id  INT,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150),
  phone       VARCHAR(30),
  job_title   VARCHAR(100),
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_company
    FOREIGN KEY (company_id) REFERENCES companies(id)
    ON DELETE SET NULL,
  INDEX idx_contact_name (last_name, first_name),
  INDEX idx_contact_email (email)
);

-- A few sample rows so the UI has something to show on first run (optional)
INSERT INTO companies (name, industry, website, phone, address) VALUES
  ('Alden & Marsh Consulting', 'Consulting', 'aldenmarsh.com', '415-555-0101', '120 Bush St, San Francisco, CA'),
  ('Northbridge Robotics', 'Manufacturing', 'northbridgerobotics.com', '312-555-0166', '88 Kinzie St, Chicago, IL');

INSERT INTO contacts (company_id, first_name, last_name, email, phone, job_title, notes) VALUES
  (1, 'Priya', 'Nathan', 'priya.nathan@aldenmarsh.com', '415-555-0142', 'Operations Director', 'Prefers email over calls.'),
  (2, 'Marcus', 'Webb', 'marcus.webb@northbridgerobotics.com', '312-555-0177', 'Procurement Lead', 'Met at the fall trade show.');
