
from alembic.operations import Operations, MigrateOperation
import alembic.autogenerate.render

__all__ = ["EnumInsertOp", "EnumDeleteOp"]

@Operations.register_operation("enum_insert")
class EnumInsertOp(MigrateOperation):

	def __init__(self, tablename, data = []):
		self.tablename = tablename
		self.data = data

	@classmethod
	def enum_insert(cls, operations, tablename, data = []):
		op = cls(tablename, data)
		return operations.invoke(op)

	def reverse(self):
		return EnumDeleteOp(self.tablename, self.data)

@Operations.register_operation("enum_delete")
class EnumDeleteOp(MigrateOperation):

	def __init__(self, tablename, data = []):
		self.tablename = tablename
		self.data = data

	@classmethod
	def enum_delete(cls, operations, tablename, data = []):
		op = cls(tablename, data)
		return operations.invoke(op)

	def reverse(self):
		return EnumInsertOp(self.tablename, self.data)

@Operations.implementation_for(EnumInsertOp)
def insert(operations, operation):
	if not operation.data:
		return
	values = ', '.join("('" + v + "')" for v in operation.data)
	txt = 'INSERT INTO {tn} (item_id) VALUES {vl}'.format(tn = operation.tablename, vl = values)
	operations.execute(txt)

@Operations.implementation_for(EnumDeleteOp)
def delete(operations, operation):
	if not operation.data:
		return
	values = ', '.join("'" + v + "'" for v in operation.data)
	txt = 'DELETE FROM {tn} WHERE item_id IN ({vl})'.format(tn = operation.tablename, vl = values)
	operations.execute(txt)

@alembic.autogenerate.render.renderers.dispatch_for(EnumInsertOp)
def render_sync_enum_value_op(autogen_context, op):
	return 'op.enum_insert("{}", {!r})'.format(op.tablename, op.data)

@alembic.autogenerate.render.renderers.dispatch_for(EnumDeleteOp)
def render_sync_enum_value_op(autogen_context, op):
	return 'op.enum_delete("{}", {!r})'.format(op.tablename, op.data)