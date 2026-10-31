ALTER TABLE "Course" ADD COLUMN "instructorId" TEXT;

ALTER TABLE "Course"
ADD CONSTRAINT "Course_instructorId_fkey"
FOREIGN KEY ("instructorId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");
