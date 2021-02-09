
import sqlalchemy.types as types
import sqlalchemy as sa

__all__ = ["EnumType"]

def convert_case(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

class EnumType(types.TypeDecorator):
	impl = types.String
	def __init__(self, enumTable = None, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.__enum__ = enumTable
	def process_bind_param(self, value, dialect):
		if value is None:
			return None
		return value.name
	def process_result_value(self, value, dialect):
		if value is None:
			return None
		return self.__enum__.__enum__[value]
