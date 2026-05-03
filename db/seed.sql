-- SlugMarketplace admin seed data (development only)
-- All admin passwords: slugmarket123  (bcrypt hash)

INSERT INTO admins (email, password_hash) VALUES
  ('admin1@slugmarketplace.ucsc.edu', '$2b$10$mxvsiqdA/t.kr4dGAiF7G.laxb/A42vCQub7N8iviXsEr2nTbQQ/m'),
  ('admin2@slugmarketplace.ucsc.edu', '$2b$10$mxvsiqdA/t.kr4dGAiF7G.laxb/A42vCQub7N8iviXsEr2nTbQQ/m'),
  ('admin3@slugmarketplace.ucsc.edu', '$2b$10$mxvsiqdA/t.kr4dGAiF7G.laxb/A42vCQub7N8iviXsEr2nTbQQ/m')
ON CONFLICT (email) DO NOTHING;
