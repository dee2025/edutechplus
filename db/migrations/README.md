Run the migration to add article fields

This repository does not include an automated migration runner. To add the optional fields used by the updated admin article form (subtitle, canonical_url, tags, content_format), run the SQL file against your MySQL database:

1. From the repo root run (using mysql CLI):

   mysql -u <user> -p <database> < db/migrations/2026-01-30-add-article-fields.sql

2. Or paste the SQL into your DB GUI (phpMyAdmin, TablePlus, MySQL Workbench, etc.) and run it.

Note: If you'd rather store tags as JSON, uncomment and adjust the JSON migration comment in the file.

Run the new `users` and `comments` migration to enable user signup/login and article comments:

1. From the repo root run (using mysql CLI):

   mysql -u <user> -p <database> < db/migrations/2026-01-30-add-users-and-comments.sql

2. Or paste the SQL into your DB GUI and run it.

The `comments` table references `articles(id)` and `users(id)` via foreign keys; ensure your database supports foreign keys and that the `articles` table exists before running.
