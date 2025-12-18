"""
Add summary_shares table for shareable summary report links

Revision ID: 0002_add_summary_shares
Revises: 0001_initial_schema
Create Date: 2024-12-17
"""

from alembic import op
import sqlalchemy as sa

# Revision identifiers
revision = '0002_add_summary_shares'
down_revision = '0001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create summary_shares table."""
    
    op.create_table(
        'summary_shares',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('token', sa.String(32), nullable=False),
        sa.Column('farm_id', sa.BigInteger(), nullable=False),
        sa.Column('created_by', sa.BigInteger(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('end_date', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )

    # Create indexes
    op.create_index('idx_summary_shares_token', 'summary_shares', ['token'])
    op.create_index('idx_summary_shares_farm_id', 'summary_shares', ['farm_id'])
    op.create_index('idx_summary_shares_created_by', 'summary_shares', ['created_by'])


def downgrade() -> None:
    """Drop summary_shares table."""
    
    op.drop_index('idx_summary_shares_created_by', 'summary_shares')
    op.drop_index('idx_summary_shares_farm_id', 'summary_shares')
    op.drop_index('idx_summary_shares_token', 'summary_shares')
    op.drop_table('summary_shares')
