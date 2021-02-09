
import alembic.autogenerate
from sqlalchemy import MetaData

from . import enum_column
from . import alembic_ops

def get_declared_enums(metadatas, schema, default):
	types = set(
		column.type
		for metadata in metadatas
		for table in metadata.tables.values()
		for column in table.columns if (isinstance(column.type, enum_column.EnumType) and table.schema == schema))
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

		# autogen_context.metadata can be a single MetaData instance or a sequence of
		# them.  Normalize it so that it's always a sequence.
		if isinstance(autogen_context.metadata, MetaData):
			metadatas = (autogen_context.metadata,)
		else:
			metadatas = autogen_context.metadata
		enums = get_declared_enums(metadatas, schema, default)
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


