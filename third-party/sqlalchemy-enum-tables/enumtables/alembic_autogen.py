
import alembic.autogenerate

from . import enum_column
from . import alembic_ops

def get_declared_enums(metadata, schema, default):
	types = set(column.type for table in metadata.tables.values() for column in table.columns if (isinstance(column, enum_column.EnumColumn) and table.schema == schema))
	return {typ.__enum__.__tablename__ : frozenset(typ.__enum__.__enum__.__members__) for typ in types}

def is_table_present(tablename, connection):
	try:
		connection.execute("SELECT * FROM {} LIMIT 0;".format(tablename))
	except:
		return False
	else:
		return True

@alembic.autogenerate.comparators.dispatch_for("schema")
def compare_enums(autogen_context, upgrade_ops, schema_names):
	for schema in schema_names:
		default = autogen_context.dialect.default_schema_name
		if schema is None:
			schema = default

		enums = get_declared_enums(autogen_context.metadata, schema, default)
		for table, values in enums.items():
			if is_table_present(table, autogen_context.connection):
				items = {r[0] for r in autogen_context.connection.execute("SELECT item_id FROM {}".format(table))}
				to_add = values - items
				to_remove = items - values
				if to_add:
					upgrade_ops.ops.append(alembic_ops.EnumInsertOp(table, list(to_add)))
				if to_remove:
					upgrade_ops.ops.append(alembic_ops.EnumDeleteOp(table, list(to_remove)))
			else:
				upgrade_ops.ops.append(alembic_ops.EnumInsertOp(table, list(values)))


