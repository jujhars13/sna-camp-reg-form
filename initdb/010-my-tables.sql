BEGIN;

SET client_encoding = 'LATIN1';

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    source text NOT NULL,
    dateFed timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE snaCamp (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    otherNames VARCHAR(100),
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    dob DATE NOT NULL,
    addressLine1 VARCHAR(255) NOT NULL,
    addressLine2 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    guardianName VARCHAR(100) NOT NULL,
    guardianNumber VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    allergies TEXT,
    notes TEXT,
    tshirtsize VARCHAR(10) NOT NULL,
    yearAttendedBefore INTEGER CHECK (yearAttendedBefore >= 1900 AND yearAttendedBefore <= EXTRACT(YEAR FROM CURRENT_DATE))
);

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

COMMIT;
