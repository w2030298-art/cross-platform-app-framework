-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feishuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PHD',
    "avatar" TEXT,
    "email" TEXT,
    "labId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "labs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "labs_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "labId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "projects_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "purpose" TEXT,
    "process" TEXT,
    "result" TEXT,
    "conclusion" TEXT,
    "nextStep" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT,
    "attachments" TEXT,
    "authorId" TEXT NOT NULL,
    "projectId" TEXT,
    "labId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "experiments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "experiments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "experiments_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "quote" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "experimentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "comments_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "papers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "abstract_" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "venue" TEXT,
    "authorId" TEXT NOT NULL,
    "projectId" TEXT,
    "labId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDEA',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "papers_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "papers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "papers_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "paper_milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "plannedDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "paper_milestones_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "papers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "labId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "weekEnd" DATETIME NOT NULL,
    "meetingDate" DATETIME,
    "meetingUrl" TEXT,
    "meetingNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "feishuDocId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_reports_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weekly_report_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experimentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "experimentsInProgress" INTEGER NOT NULL DEFAULT 0,
    "experimentsFailed" INTEGER NOT NULL DEFAULT 0,
    "keyFindings" TEXT,
    "problems" TEXT,
    "nextWeekPlan" TEXT,
    "actionItems" TEXT,
    "experimentIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "weekly_report_lines_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "weekly_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "weekly_report_lines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "labId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipment_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipment_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipment_bookings_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "equipment_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_feishuId_key" ON "users"("feishuId");

-- CreateIndex
CREATE INDEX "experiments_authorId_idx" ON "experiments"("authorId");

-- CreateIndex
CREATE INDEX "experiments_labId_idx" ON "experiments"("labId");

-- CreateIndex
CREATE INDEX "experiments_status_idx" ON "experiments"("status");

-- CreateIndex
CREATE INDEX "comments_experimentId_idx" ON "comments"("experimentId");

-- CreateIndex
CREATE INDEX "papers_authorId_idx" ON "papers"("authorId");

-- CreateIndex
CREATE INDEX "papers_labId_idx" ON "papers"("labId");

-- CreateIndex
CREATE INDEX "paper_milestones_paperId_idx" ON "paper_milestones"("paperId");

-- CreateIndex
CREATE INDEX "weekly_reports_labId_idx" ON "weekly_reports"("labId");

-- CreateIndex
CREATE INDEX "weekly_report_lines_reportId_idx" ON "weekly_report_lines"("reportId");

-- CreateIndex
CREATE INDEX "weekly_report_lines_userId_idx" ON "weekly_report_lines"("userId");

-- CreateIndex
CREATE INDEX "equipment_bookings_equipmentId_idx" ON "equipment_bookings"("equipmentId");

-- CreateIndex
CREATE INDEX "equipment_bookings_userId_idx" ON "equipment_bookings"("userId");
