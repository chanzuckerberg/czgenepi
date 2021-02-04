
import sqlalchemy.types as types
import sqlalchemy as sa

__all__ = ["EnumColumn"]

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

class EnumColumn(sa.Column):
	"""
	Column class for enumerations.

	This class replaces ``sqlalchemy.Column`` for an enumeration.

	Typical usage::

		class Spam(Base):
			__tablename__ = "spam"
			id = sqlalchemy.Column(sqlalchemy.Integer, primary_key = True)
			egg = enumtables.EnumColumn(EggEnum)
	
	This will create a ``spam`` table with an integer PK column ``id``,
	a string type column ``egg``, and a foreign key from ``spam.egg``
	to ``egg_enum.item_id``.

	On a valued instance, its value is an instance of the enum type.
	"""
	def __init__(self, enumTable, tablename = None, *args, **kwargs):
		"""
		Constructor for an enum column

		Parameters
		----------
		enum : subclass of enum.Enum
			The enumeration class for which the column will be created.
			This class **must** have had an ``EnumTable`` created previously.
		tablename : str
			If the table name has been overriden in the ``EnumTable``,
			the same name **must** be provided here.
		
		All remaining arguments are passed to the constructor of ``sqlalchemy.Column``.
		"""
		tn = tablename if tablename else enumTable.__tablename__
		fk = sa.ForeignKey(enumTable.item_id)
		tp = EnumType(enumTable)
		super().__init__(tp, fk, *args, **kwargs)