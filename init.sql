CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL
);
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  nik VARCHAR(20) NOT NULL,
  nokk VARCHAR(20) NOT NULL,
  pktp VARCHAR(255),
  pkk VARCHAR(255) NOT NULL,
  psign VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  admin_id integer REFERENCES admins,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);
CREATE TABLE mappers (
  id SERIAL PRIMARY KEY,
  localphone VARCHAR(255) NOT NULL,
  idphone VARCHAR(255) NOT NULL UNIQUE,
  admin_id integer REFERENCES admins,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

INSERT INTO admins (username, password, country)
VALUES  ('admintelin', '1bea0074d6f1381fd13269565d91a344','All'); 
