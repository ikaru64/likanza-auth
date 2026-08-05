-- À exécuter dans le SQL Editor de Neon, une seule fois.

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  email TEXT PRIMARY KEY REFERENCES users(email),
  data JSONB,
  updated_at TIMESTAMP DEFAULT now()
);
