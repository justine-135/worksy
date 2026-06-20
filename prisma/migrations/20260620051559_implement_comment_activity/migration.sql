-- CreateTable
CREATE TABLE "comment_detail" (
    "id" TEXT NOT NULL,
    "activity_log_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_detail_activity_log_id_key" ON "comment_detail"("activity_log_id");

-- AddForeignKey
ALTER TABLE "comment_detail" ADD CONSTRAINT "comment_detail_activity_log_id_fkey" FOREIGN KEY ("activity_log_id") REFERENCES "activity_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;
