/**
 * @openapi
 * /reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Dashboard summary statistics
 *     description: |
 *       Returns high-level KPIs scoped to the authenticated user's accessible projects.
 *
 *       **Scope rules:**
 *       - **ADMIN** — aggregates across all projects
 *       - **MAINTAINER** — aggregates across projects they own
 *       - **MEMBER** — aggregates across projects they are a member of
 *
 *       `tasksCompletedThisWeek` counts tasks currently in **DONE** status whose
 *       `updatedAt` falls within the current ISO week (Monday 00:00 UTC).
 *       `tasksCreatedLast30Days` counts tasks created in the last 30 calendar days.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Aggregated summary statistics.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SummaryReport'
 *             example:
 *               status: success
 *               data:
 *                 totalProjects: 8
 *                 totalTasks: 142
 *                 tasksByStatus:
 *                   - statusName: TODO
 *                     count: 64
 *                   - statusName: IN_PROGRESS
 *                     count: 31
 *                   - statusName: CODE_REVIEW
 *                     count: 12
 *                   - statusName: DONE
 *                     count: 35
 *                 tasksCompletedThisWeek: 7
 *                 tasksCreatedLast30Days: 29
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /reports/tasks-by-project:
 *   get:
 *     tags: [Reports]
 *     summary: Task counts broken down by project
 *     description: |
 *       Returns each accessible project with its total task count and a per-status breakdown.
 *       Projects with no tasks are included (total: 0).
 *       An optional date range filters tasks by `createdAt`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or after this ISO 8601 timestamp.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or before this ISO 8601 timestamp.
 *     responses:
 *       '200':
 *         description: Per-project task breakdown.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProjectTaskBreakdown'
 *             example:
 *               status: success
 *               data:
 *                 - projectId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                   projectName: E-Commerce Platform
 *                   total: 18
 *                   byStatus:
 *                     - statusName: DONE
 *                       count: 9
 *                     - statusName: IN_PROGRESS
 *                       count: 5
 *                     - statusName: TODO
 *                       count: 4
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /reports/tasks-by-assignee:
 *   get:
 *     tags: [Reports]
 *     summary: Task counts broken down by assignee
 *     description: |
 *       Returns each assignee with their total task count and a per-status breakdown
 *       within the caller's accessible scope.
 *       Unassigned tasks are grouped under a `null` assignee entry.
 *       Optionally narrow to a single project with `projectId`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or after this timestamp.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or before this timestamp.
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Narrow to a specific project (must be accessible to the caller).
 *     responses:
 *       '200':
 *         description: Per-assignee task breakdown.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AssigneeTaskBreakdown'
 *             example:
 *               status: success
 *               data:
 *                 - assigneeId: c3d4e5f6-a7b8-9012-cdef-123456789012
 *                   assigneeName: Alice Carter
 *                   total: 11
 *                   byStatus:
 *                     - statusName: IN_PROGRESS
 *                       count: 5
 *                     - statusName: DONE
 *                       count: 4
 *                     - statusName: TODO
 *                       count: 2
 *                 - assigneeId: null
 *                   assigneeName: null
 *                   total: 4
 *                   byStatus:
 *                     - statusName: TODO
 *                       count: 4
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @openapi
 * /reports/activity-over-time:
 *   get:
 *     tags: [Reports]
 *     summary: Activity event counts over time
 *     description: |
 *       Returns a time-series of activity event counts bucketed by `day` or `week`
 *       (PostgreSQL `DATE_TRUNC`). Dates are returned as `YYYY-MM-DD` strings
 *       (the start of each bucket in UTC).
 *       Optionally narrow to a specific project with `projectId`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the time window (inclusive).
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of the time window (inclusive).
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Narrow to a specific project.
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week]
 *           default: day
 *         description: Time bucket size.
 *     responses:
 *       '200':
 *         description: Time-series activity counts.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityDataPoint'
 *             example:
 *               status: success
 *               data:
 *                 - date: '2025-06-16'
 *                   count: 12
 *                 - date: '2025-06-17'
 *                   count: 7
 *                 - date: '2025-06-18'
 *                   count: 19
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @openapi
 * /reports/completion-rate:
 *   get:
 *     tags: [Reports]
 *     summary: Task completion rate
 *     description: |
 *       Returns the percentage of tasks in **DONE** status within the caller's scope.
 *       An optional date range filters tasks by `createdAt`.
 *       The rate is rounded to 2 decimal places (e.g. `66.67`).
 *       Returns `{ completionRate: 0 }` when there are no tasks in scope.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or after this timestamp.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only tasks created at or before this timestamp.
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Narrow to a specific project.
 *     responses:
 *       '200':
 *         description: Completion rate metrics.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CompletionRateReport'
 *             example:
 *               status: success
 *               data:
 *                 totalTasks: 142
 *                 completedTasks: 35
 *                 completionRate: 24.65
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

export {};
