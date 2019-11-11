CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  nik VARCHAR(20) NOT NULL,
  nokk VARCHAR(20) NOT NULL,
  pktp VARCHAR(255),
  pkk VARCHAR(255),
  status VARCHAR(255) NOT NULL,
  admin_id integer REFERENCES admins,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- admintelin123
INSERT INTO admins (username, password)
VALUES  ('admintelin', '04813afdadc13165a1ba4d75fec182e0'); 
