BEGIN;

SET client_encoding = 'LATIN1';

CREATE TABLE public.snacamp (
    id serial PRIMARY KEY,
    firstname character varying(100) NOT NULL,
    surname character varying(100) NOT NULL,
    othernames character varying(100),
    gender character(1) NOT NULL,
    dob date NOT NULL,
    addressline1 character varying(255) NOT NULL,
    addressline2 character varying(255),
    city character varying(100) NOT NULL,
    postcode character varying(20) NOT NULL,
    guardianname character varying(100) NOT NULL,
    guardiannumber character varying(15) NOT NULL,
    email character varying(255),
    allergies text,
    notes text,
    tshirtsize character varying(10),
    campname character varying,
    environment character varying,
    terms boolean,
    deleted timestamp without time zone,
    formversion character varying(20) NOT NULL,
    "dateCreated" timestamp without time zone DEFAULT now(),
    CONSTRAINT snacamp_gender_check CHECK ((gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

COMMIT;
