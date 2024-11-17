-- CreateTable
CREATE TABLE "collections_tb" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "collections_tb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_tb" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "is_done" BOOLEAN DEFAULT false,
    "collections_id" INTEGER,

    CONSTRAINT "task_tb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_tb" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_tb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_tb_name_key" ON "task_tb"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_tb_email_key" ON "users_tb"("email");

-- AddForeignKey
ALTER TABLE "task_tb" ADD CONSTRAINT "task_tb_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections_tb"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
