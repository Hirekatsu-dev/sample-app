DROP DOMAIN IF EXISTS domain_get_build_update_code CASCADE;
CREATE DOMAIN domain_get_build_update_code AS TEXT;

CREATE OR REPLACE FUNCTION get_build_update_code (
  p_updated_at TIMESTAMPTZ DEFAULT NULL
) RETURNS domain_get_build_update_code AS $FUNCTION$
BEGIN
  RETURN EXTRACT(MILLISECONDS FROM p_updated_at)::TEXT;
END;
$FUNCTION$ LANGUAGE plpgsql IMMUTABLE;
