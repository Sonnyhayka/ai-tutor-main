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


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), nullable=False)
    description = Column(String(100), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    files = relationship("File", back_populates="course", cascade="all, delete-orphan")
    user = relationship("User", back_populates="courses")
    tutor_sessions = relationship(
        "TutorSession",
        back_populates="course",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("name", "user_id", name="unique_course_per_user"),
    )
