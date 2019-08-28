CREATE TYPE sex AS ENUM ('Male','Female');

CREATE TABLE USERS(
id BIGSERIAL NOT NULL PRIMARY KEY,
username VARCHAR(100) NOT NULL,
password VARCHAR(200) NOT NULL,
age BIGINT NOT NULL,
sex sex NOT NULL,
phonenumber BIGINT NOT NULL UNIQUE,
email VARCHAR(300) NOT NULL UNIQUE,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL
);