USE ngt_safe_co2;

UPDATE users
SET password = '$2a$10$zKcSXMhljtmfFUE/oUel0.ghMWLTEtmeRlo87zeuLKbNSSWYbSXcG',
    email_verified_at = COALESCE(email_verified_at, NOW()),
    updated_at = NOW()
WHERE email = 'pasien@iot.local';

UPDATE users
SET password = '$2a$10$iG7WIworlnHdYfxkArOw4engmNStjO46ItoCcu6n8aiz744Pf1ST6',
    email_verified_at = COALESCE(email_verified_at, NOW()),
    updated_at = NOW()
WHERE email = 'perawat@iot.local';
