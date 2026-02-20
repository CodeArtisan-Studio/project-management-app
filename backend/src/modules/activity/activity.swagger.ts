/**
 * @openapi
 * /projects/{id}/activities:
 *   get:
 *     tags: [Activities]
 *     summary: List project activity
 *     description: |
 *       Returns a reverse-chronological, paginated feed of all activity events
 *       that occurred within the project (project changes, member management,
 *       task lifecycle, status management).
 *
 *       **Access rules** (mirrors project visibility):
 *       - **ADMIN** — any project
 *       - **MAINTAINER** — projects they own
 *       - **MEMBER** — projects they are a member of
 *
 *       **Filtering** — combine any subset of `action`, `userId`, `from`, `to`
 *       to narrow the feed. All filters are additive (AND).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of events per page.
 *       - in: query
 *         name: action
 *         schema:
 *           $ref: '#/components/schemas/ActivityAction'
 *         description: Filter to a specific action type.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter to events triggered by a specific user.
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only events at or after this ISO 8601 timestamp.
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Include only events at or before this ISO 8601 timestamp.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction — `desc` (newest first) or `asc` (oldest first).
 *     responses:
 *       '200':
 *         description: Paginated activity feed.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedActivities'
 *             example:
 *               status: success
 *               data:
 *                 data:
 *                   - id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *                     projectId: b2c3d4e5-f6a7-8901-bcde-f12345678901
 *                     userId: c3d4e5f6-a7b8-9012-cdef-123456789012
 *                     action: TASK_STATUS_CHANGED
 *                     metadata:
 *                       taskId: d4e5f6a7-b8c9-0123-defa-234567890123
 *                       taskTitle: Integrate Stripe payment gateway
 *                       fromStatusId: e5f6a7b8-c9d0-1234-efab-345678901234
 *                       toStatusId: f6a7b8c9-d0e1-2345-fabc-456789012345
 *                     createdAt: '2024-06-15T10:30:00.000Z'
 *                     user:
 *                       id: c3d4e5f6-a7b8-9012-cdef-123456789012
 *                       firstName: Alice
 *                       lastName: Carter
 *                       email: alice@pma.dev
 *                 meta:
 *                   total: 84
 *                   page: 1
 *                   limit: 20
 *                   totalPages: 5
 *                   hasNextPage: true
 *                   hasPreviousPage: false
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
