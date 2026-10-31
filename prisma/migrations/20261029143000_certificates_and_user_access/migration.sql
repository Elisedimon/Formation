ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");
CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON "Certificate"("enrollmentId");

ALTER TABLE "Certificate"
ADD CONSTRAINT "Certificate_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Certificate"
ADD CONSTRAINT "Certificate_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
