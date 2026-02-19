/**
 * @openapi
 * /projects/{id}/statuses:
 *   get:
 *     tags: [Statuses]
 *     summary: List task statuses
 *     description: Returns all custom task statuses for a project, ordered by `order` ASC. Accessible by the project owner, ADMIN, or any project member.
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
 *     responses:
 *       '200':
 *         description: List of task statuses.
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
 *                         $ref: '#/components/schemas/TaskStatus'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     tags: [Statuses]
 *     summary: Create a task status
 *     description: Adds a new custom status to the project. Restricted to the project owner (MAINTAINER) or **ADMIN**.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: DEPLOYED
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 example: '#8B5CF6'
 *                 description: Optional hex color (e.g. #8B5CF6).
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 example: 4
 *     responses:
 *       '201':
 *         description: Task status created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: Task status created successfully.
 *                     data:
 *                       $ref: '#/components/schemas/TaskStatus'
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
 * /projects/{id}/statuses/{statusId}:
 *   patch:
 *     tags: [Statuses]
 *     summary: Update a task status
 *     description: Updates one or more fields of a task status. Restricted to the project owner or **ADMIN**.
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
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task status ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 nullable: true
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       '200':
 *         description: Task status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: Task status updated successfully.
 *                     data:
 *                       $ref: '#/components/schemas/TaskStatus'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Statuses]
 *     summary: Delete a task status
 *     description: Deletes a task status. Blocked with **409 Conflict** if any active task is currently using this status — reassign those tasks first. Restricted to the project owner or **ADMIN**.
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
 *       - in: path
 *         name: statusId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task status ID.
 *     responses:
 *       '204':
 *         $ref: '#/components/responses/NoContent'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '409':
 *         description: Status is in use by one or more tasks.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               status: fail
 *               message: Cannot delete a status that is in use by one or more tasks. Reassign those tasks first.
 */

/**
 * @openapi
 * /projects/{id}/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks in a project
 *     description: Returns a paginated list of tasks for the project. Accessible by the project owner, ADMIN, or any member.
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on title and description.
 *       - in: query
 *         name: statusId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by task status ID.
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assignee user ID.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, order, title]
 *           default: order
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       '200':
 *         description: Paginated list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedTasks'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     description: Creates a new task in the project. Accessible by the project owner, ADMIN, or any project member. The `statusId` must belong to this project.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, statusId]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: Implement rate limiting
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Add sliding-window rate limiter using Redis.
 *               statusId:
 *                 type: string
 *                 format: uuid
 *                 description: Must be a status belonging to this project.
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional user ID to assign the task to.
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *     responses:
 *       '201':
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: Task created successfully.
 *                     data:
 *                       $ref: '#/components/schemas/Task'
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
 * /projects/{id}/tasks/{taskId}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a task by ID
 *     description: Returns a single task. Accessible by the project owner, ADMIN, or any project member.
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     responses:
 *       '200':
 *         description: Task details.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     description: Updates one or more fields of a task. Accessible by the project owner, ADMIN, or any project member. If `statusId` is changed, the new status must belong to this project.
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               statusId:
 *                 type: string
 *                 format: uuid
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Set to null to unassign.
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       '200':
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: Task updated successfully.
 *                     data:
 *                       $ref: '#/components/schemas/Task'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     description: Soft-deletes a task. Restricted to the project owner (MAINTAINER) or **ADMIN**.
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID.
 *     responses:
 *       '204':
 *         $ref: '#/components/responses/NoContent'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

export {};
