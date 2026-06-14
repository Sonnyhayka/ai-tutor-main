from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True)
    google_drive_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    course = relationship("Course", back_populates="files")
    user = relationship("User", back_populates="files")

    __table_args__ = (
        UniqueConstraint("name", "course_id", name="unique_file_per_course"),
    )
