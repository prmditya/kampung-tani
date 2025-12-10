# Database Migration Guide

## Migration 001: Historical Assignment Tracking

### What Changed?

Added `farm_id` and `assigned_by` columns to `sensor_data` table to preserve historical assignment context.

### Why?

Before this change, sensor data was linked to farms only through active `gateway_assignments`. When an assignment was deleted or changed, historical data would "lose" its farm context. Now, we snapshot the assignment info when data arrives, creating a permanent record.

### How to Run

#### Step 1: Run SQL Migration

```bash
# Connect to PostgreSQL
psql -U <username> -d <database_name> -f db/migrations/001_add_historical_assignment_to_sensor_data.sql
```

Or via Docker:

```bash
docker exec -i <postgres_container> psql -U <username> -d <database_name> < db/migrations/001_add_historical_assignment_to_sensor_data.sql
```

#### Step 2: Verify Migration

```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sensor_data'
  AND column_name IN ('farm_id', 'assigned_by');

-- Check backfill status
SELECT
    COUNT(*) as total_rows,
    COUNT(farm_id) as rows_with_farm,
    COUNT(assigned_by) as rows_with_assigned_by,
    COUNT(*) - COUNT(farm_id) as orphaned_rows
FROM sensor_data;
```

#### Step 3: Restart Services

```bash
# Restart backend
docker-compose restart backend

# Restart ingestion service
docker-compose restart ingestion
```

### What's Updated?

**Database:**

- `sensor_data` table now has:
  - `farm_id` (BIGINT, nullable, indexed)
  - `assigned_by` (BIGINT, nullable, indexed)

**Backend (`backend/`):**

- `models/sensor_data.py` - Added new fields and relationships
- `repositories/sensor_data_repository.py` - Simplified queries (no more join to gateway_assignments)

**Ingestion Service (`ingestion/`):**

- `services/data_service.py` - Now sets `farm_id` and `assigned_by` on every new sensor data

### Backwards Compatibility

- Existing data without assignments will have `NULL` values (acceptable)
- Migration includes backfill for existing data
- Queries work for both old and new data

### Testing

After migration:

1. Create a new gateway assignment
2. Send sensor data via MQTT
3. Check that `farm_id` and `assigned_by` are populated:
   ```sql
   SELECT id, sensor_id, farm_id, assigned_by, value, timestamp
   FROM sensor_data
   ORDER BY timestamp DESC
   LIMIT 10;
   ```
4. Delete or change the assignment
5. Verify that old sensor data still shows correct farm/assigned_by

### Rollback (If Needed)

```sql
-- Remove columns
ALTER TABLE sensor_data DROP COLUMN farm_id;
ALTER TABLE sensor_data DROP COLUMN assigned_by;

-- Remove indexes
DROP INDEX IF EXISTS idx_sensor_data_farm_id;
DROP INDEX IF EXISTS idx_sensor_data_assigned_by;
```

Then revert code changes and restart services.
