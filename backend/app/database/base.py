"""
SQLAlchemy Declarative Base for Application Data.

IMPORTANT ARCHITECTURAL DISTINCTION:
This database base class is used solely for the web application's internal persistence
(e.g., saved problem history, user analysis sessions, pre-configured sample cases).
It is NOT the same thing as the user-defined relational schemas (tables, attributes, FDs)
that students enter into the Normalization Lab for 1NF-4NF academic analysis.
The student's schemas are handled in-memory and analyzed by deterministic algorithms.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
