-- CreateTable
CREATE TABLE "USERS" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "REVIEW" (
    "review_id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shop_id" INTEGER NOT NULL,

    CONSTRAINT "REVIEW_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "SHOP" (
    "shop_id" SERIAL NOT NULL,
    "shop_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "SHOP_pkey" PRIMARY KEY ("shop_id")
);

-- CreateTable
CREATE TABLE "LOCATION" (
    "location_id" SERIAL NOT NULL,
    "location_name" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LOCATION_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "IMAGE" (
    "id" SERIAL NOT NULL,
    "asset_id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secure_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_id" INTEGER NOT NULL,

    CONSTRAINT "IMAGE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PM_LOCATION" (
    "id" SERIAL NOT NULL,
    "pm_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "PM_LOCATION_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PM25_DATA" (
    "pm_id" SERIAL NOT NULL,
    "pm_value" DOUBLE PRECISION NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level_id" INTEGER NOT NULL,

    CONSTRAINT "PM25_DATA_pkey" PRIMARY KEY ("pm_id")
);

-- CreateTable
CREATE TABLE "SAFETY_LEVELS" (
    "level_id" SERIAL NOT NULL,
    "level_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold_pm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SAFETY_LEVELS_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "RECOMMENDATIONS" (
    "recommendation_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "create_id" TEXT NOT NULL,
    "updated_id" TEXT NOT NULL,

    CONSTRAINT "RECOMMENDATIONS_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USERS_email_key" ON "USERS"("email");

-- AddForeignKey
ALTER TABLE "REVIEW" ADD CONSTRAINT "REVIEW_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "USERS"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REVIEW" ADD CONSTRAINT "REVIEW_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "SHOP"("shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SHOP" ADD CONSTRAINT "SHOP_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "LOCATION"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IMAGE" ADD CONSTRAINT "IMAGE_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "SHOP"("shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PM_LOCATION" ADD CONSTRAINT "PM_LOCATION_pm_id_fkey" FOREIGN KEY ("pm_id") REFERENCES "PM25_DATA"("pm_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PM_LOCATION" ADD CONSTRAINT "PM_LOCATION_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "LOCATION"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PM25_DATA" ADD CONSTRAINT "PM25_DATA_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "SAFETY_LEVELS"("level_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RECOMMENDATIONS" ADD CONSTRAINT "RECOMMENDATIONS_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "SAFETY_LEVELS"("level_id") ON DELETE RESTRICT ON UPDATE CASCADE;
