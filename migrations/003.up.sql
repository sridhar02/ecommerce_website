CREATE TABLE Logins(
user_id BIGINT REFERENCES users(id),
secret  VARCHAR(40) NOT NULL,
created_at TIMESTAMP NOT NULL,
updated_at TIMESTAMP NOT NULL
);