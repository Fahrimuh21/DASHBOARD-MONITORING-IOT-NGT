USE ngt_safe_co2;

ALTER TABLE users
  ADD COLUMN profile_photo LONGTEXT NULL AFTER alamat;
