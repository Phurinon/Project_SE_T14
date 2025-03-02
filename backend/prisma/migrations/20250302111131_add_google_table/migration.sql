-- CreateTable
CREATE TABLE "UserGoogle" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "googleId" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGoogle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogle_email_key" ON "UserGoogle"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogle_googleId_key" ON "UserGoogle"("googleId");
