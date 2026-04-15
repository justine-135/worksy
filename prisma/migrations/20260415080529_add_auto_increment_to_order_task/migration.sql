-- AlterTable
CREATE SEQUENCE task_order_seq;
ALTER TABLE "task" ALTER COLUMN "order" SET DEFAULT nextval('task_order_seq');
ALTER SEQUENCE task_order_seq OWNED BY "task"."order";
