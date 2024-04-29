--CREATE DATABASE sigmadb;

CREATE TABLE attended (
    user_name varchar(510), -- 255 + 255
    email varchar(256) NOT NULL,--rfc standard says 320 however really it's 256
    event_id varchar(36) NOT NULL,
    time TIMESTAMPTZ NOT NULL,
    major varchar(255),
    cohort int,
    year int
);

CREATE TABLE events (
    org_name varchar(510) NOT NULL,
    org_email varchar(256) NOT NULL,
    event_id varchar(36) NOT NULL UNIQUE,
    event_name varchar(255) NOT NULL UNIQUE, --prevents duplicate event name
    req_mcy boolean NOT NULL, --require major cohort year
    event_desc text,
    event_date TIMESTAMPTZ NOT NULL,
    event_pass varchar(255) NOT NULL,
    location_Veri boolean NOT NULL,
    latitude real,
    longitude real,
    radius real
);

