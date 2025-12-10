-- =============================================
-- Migration: Add Historical Assignment Tracking
-- Date: 2025-12-10
-- Purpose: Store farm_id and assigned_by snapshot in sensor_data
--          to preserve historical context even when assignments change
-- =============================================

-- Step 1: Add new columns to sensor_data
ALTER TABLE sensor_data 
ADD COLUMN farm_id BIGINT REFERENCES farms(id) ON DELETE SET NULL,
ADD COLUMN assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Step 2: Create index for better query performance
CREATE INDEX idx_sensor_data_farm_id ON sensor_data(farm_id);
CREATE INDEX idx_sensor_data_assigned_by ON sensor_data(assigned_by);

-- Step 3: Backfill existing data with current active assignments
UPDATE sensor_data sd
SET 
    farm_id = ga.farm_id,
    assigned_by = ga.assigned_by
FROM gateway_assignments ga
WHERE sd.gateway_id = ga.gateway_id 
  AND ga.is_active = true
  AND sd.farm_id IS NULL;  -- Only update rows that haven't been set yet

-- Step 4: Verify migration
SELECT 
    COUNT(*) as total_rows,
    COUNT(farm_id) as rows_with_farm,
    COUNT(assigned_by) as rows_with_assigned_by,
    COUNT(*) - COUNT(farm_id) as orphaned_rows
FROM sensor_data;

-- Expected result:
-- - total_rows: all sensor data
-- - rows_with_farm: should be close to total (except very old data)
-- - orphaned_rows: sensor data without active assignment (these are OK, historical data)

COMMENT ON COLUMN sensor_data.farm_id IS 'Snapshot of farm assignment at the time data was received';
COMMENT ON COLUMN sensor_data.assigned_by IS 'Snapshot of user who assigned gateway at the time data was received';
