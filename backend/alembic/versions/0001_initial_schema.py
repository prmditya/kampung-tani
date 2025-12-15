"""
Initial database schema migration
Creates all tables for Kampoeng Tani IoT system
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers
revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create all database tables."""
    
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(50), nullable=False),
        sa.Column('email', sa.String(150), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), server_default='admin', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    # Farmers table
    op.create_table(
        'farmers',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('contact', sa.String(50), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Farms table
    op.create_table(
        'farms',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('farmer_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('location', sa.String(200), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('area_size', sa.Float(), nullable=True),
        sa.Column('soil_type', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Gateways table
    op.create_table(
        'gateways',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('gateway_uid', sa.String(100), nullable=False),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('mac_address', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), server_default='offline', nullable=True),
        sa.Column('last_seen', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('gateway_uid')
    )

    # Sensors table
    op.create_table(
        'sensors',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('gateway_id', sa.BigInteger(), nullable=False),
        sa.Column('sensor_uid', sa.String(100), nullable=False),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('unit', sa.String(20), nullable=True),
        sa.Column('status', sa.String(20), server_default='inactive', nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['gateway_id'], ['gateways.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sensor_uid')
    )

    # Gateway assignments table
    op.create_table(
        'gateway_assignments',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('gateway_id', sa.BigInteger(), nullable=False),
        sa.Column('farm_id', sa.BigInteger(), nullable=False),
        sa.Column('assigned_by', sa.BigInteger(), nullable=True),
        sa.Column('start_date', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True),
        sa.ForeignKeyConstraint(['gateway_id'], ['gateways.id']),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id']),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Sensor data table
    op.create_table(
        'sensor_data',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('sensor_id', sa.BigInteger(), nullable=False),
        sa.Column('gateway_id', sa.BigInteger(), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(20), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('farm_id', sa.BigInteger(), nullable=True),
        sa.Column('assigned_by', sa.BigInteger(), nullable=True),
        sa.ForeignKeyConstraint(['sensor_id'], ['sensors.id']),
        sa.ForeignKeyConstraint(['gateway_id'], ['gateways.id']),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['assigned_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Gateway status history table
    op.create_table(
        'gateway_status_history',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('gateway_id', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('uptime_seconds', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['gateway_id'], ['gateways.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('idx_gateways_user_id', 'gateways', ['user_id'])
    op.create_index('idx_gateways_status', 'gateways', ['status'])
    op.create_index('idx_sensors_gateway_id', 'sensors', ['gateway_id'])
    op.create_index('idx_sensor_data_sensor_id_timestamp', 'sensor_data', ['sensor_id', sa.text('timestamp DESC')])
    op.create_index('idx_sensor_data_gateway_id_timestamp', 'sensor_data', ['gateway_id', sa.text('timestamp DESC')])
    op.create_index('idx_sensor_data_farm_id', 'sensor_data', ['farm_id'])
    op.create_index('idx_sensor_data_assigned_by', 'sensor_data', ['assigned_by'])


def downgrade() -> None:
    """Drop all database tables."""
    
    # Drop indexes first
    op.drop_index('idx_sensor_data_assigned_by', 'sensor_data')
    op.drop_index('idx_sensor_data_farm_id', 'sensor_data')
    op.drop_index('idx_sensor_data_gateway_id_timestamp', 'sensor_data')
    op.drop_index('idx_sensor_data_sensor_id_timestamp', 'sensor_data')
    op.drop_index('idx_sensors_gateway_id', 'sensors')
    op.drop_index('idx_gateways_status', 'gateways')
    op.drop_index('idx_gateways_user_id', 'gateways')

    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('gateway_status_history')
    op.drop_table('sensor_data')
    op.drop_table('gateway_assignments')
    op.drop_table('sensors')
    op.drop_table('gateways')
    op.drop_table('farms')
    op.drop_table('farmers')
    op.drop_table('users')
