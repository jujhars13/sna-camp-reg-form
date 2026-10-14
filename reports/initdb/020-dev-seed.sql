-- Dev only: a few campers to exercise the reports page.
-- Includes a soft-deleted row (must not appear) and a row for another camp.
INSERT INTO public.snacamp
  (firstname, surname, othernames, gender, dob, addressline1, city, postcode,
   guardianname, guardiannumber, email, allergies, notes, tshirtsize,
   campname, environment, terms, deleted, formversion)
VALUES
  ('Ajeet', 'Kaur', NULL, 'F', '2015-03-01', '1 High Street', 'West Bromwich', 'B70 7AA',
   'Harpreet Kaur', '07700900001', 'harpreet@example.com', 'Peanuts', NULL, 'S',
   'west-bromwich-2026-10-29', 'development', true, NULL, '1.3.3'),
  ('Simran', 'Singh', 'Jot', 'M', '2016-07-12', '22 Church Road', 'Smethwick', 'B66 3BB',
   'Manjit Singh', '07700900002', NULL, NULL, 'Needs collecting at 3pm', 'M',
   'west-bromwich-2026-10-29', 'development', true, NULL, '1.3.3'),
  ('Deleted', 'Camper', NULL, 'M', '2014-01-01', '3 Gone Lane', 'Oldbury', 'B69 4CC',
   'Removed Parent', '07700900003', NULL, NULL, 'SOFT DELETED, should not show', NULL,
   'west-bromwich-2026-10-29', 'development', true, now(), '1.3.3'),
  ('Navdeep', 'Bains', NULL, 'F', '2017-11-30', '4 Park Avenue', 'Birmingham', 'B11 4DD',
   'Gurpreet Bains', '07700900004', 'gurpreet@example.com', 'Dairy <milk>', NULL, NULL,
   'stratford-road-2026-08-10', 'development', true, NULL, '1.3.3');
