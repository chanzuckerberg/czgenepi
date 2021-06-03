"""adding prefix to group

Create Date: 2021-06-02 22:41:23.551982

"""
import enumtables  # noqa: F401
import sqlalchemy as sa
from alembic import op

revision = "20210602_224122"
down_revision = "20210602_211244"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "groups",
        sa.Column(
            "prefix",
            sa.String(),
            nullable=True,
            comment="used for creating public identifiers for samples",
        ),
        schema="aspen",
    )
    op.create_unique_constraint(
        op.f("uq_groups_prefix"), "groups", ["prefix"], schema="aspen"
    )

    name_to_prefix = {
        "Alameda County Public Health Department": "CA-ACPHD-",
        "Contra Costa County Public Health Laboratories": "CA-CCC-",
        "Fresno County Public Health": "CA-FC-",
        "Humboldt County Dept Human and Health Sevices-Public Health": "CA-HC-",
        "Marin County Department of Health & Human Services": "CA-MRNC-",
        "Monterey County Health Department": "CA-MCPHL-",
        "Orange County Health Care Agency": "CA-OC-",
        "San Bernardino County Public Health": "CA-SBC-",
        "San Joaquin County Public Health Services": "CA-SJC-",
        "San Luis Obispo County Health Agency, Public Health Laboratories": "CA-SLOC-",
        "Santa Clara County Public Health": "CA-SC-",
        "San Francisco Public Health Laboratory": "CA-SFC-",
        "Tulare County Public Health Lab": "CA-TCPHL-",
        "Tuolumne County Public Health": "CA-TLMNC-",
        "Ventura County Public Health Laboratory": "CA-VC-",
        "CDPH": "CA-CDPH",
    }

    set_prefix_sql = sa.sql.text(
        "UPDATE aspen.groups SET prefix=:prefix WHERE name=:name"
    )

    conn = op.get_bind()
    for name, prefix in name_to_prefix.items():
        conn.execute(set_prefix_sql.bindparams(prefix=prefix, name=name))


def downgrade():
    op.drop_constraint(
        op.f("uq_groups_prefix"), "groups", schema="aspen", type_="unique"
    )
    op.drop_column("groups", "prefix", schema="aspen")
