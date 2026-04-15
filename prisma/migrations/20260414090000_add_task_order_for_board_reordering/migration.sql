ALTER TABLE "task"
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

WITH ordered_tasks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY task_board_id
      ORDER BY created_at ASC, id ASC
    ) AS position
  FROM "task"
)
UPDATE "task" AS task
SET "order" = ordered_tasks.position
FROM ordered_tasks
WHERE task.id = ordered_tasks.id;
