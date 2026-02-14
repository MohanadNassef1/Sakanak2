
-- Recreate public_rooms view with is_student_listing field
CREATE OR REPLACE VIEW public.public_rooms WITH (security_invoker = on) AS
SELECT 
    r.id,
    r.title,
    r.description,
    r.room_type,
    r.price_per_month,
    r.city,
    r.area,
    r.address,
    r.photos,
    r.amenities,
    r.rules,
    r.available_from,
    r.min_stay_months,
    r.max_roommates,
    r.current_roommates,
    r.preferred_gender,
    r.allows_smoking,
    r.allows_pets,
    r.is_featured,
    r.status,
    r.created_at,
    r.updated_at,
    r.has_natural_gas,
    r.has_wifi,
    r.has_elevator,
    r.has_balcony,
    r.has_doorman,
    r.has_ac,
    r.has_water_heater,
    r.allows_visits,
    r.total_bedrooms,
    r.location_link,
    r.lister_type,
    r.deposit,
    r.bills_included,
    r.personality_tags,
    COALESCE(p.occupation_status = 'student', false) AS is_student_listing
FROM rooms r
LEFT JOIN profiles p ON p.user_id = r.owner_id
WHERE r.status = ANY (ARRAY['active'::listing_status, 'rented'::listing_status]);
