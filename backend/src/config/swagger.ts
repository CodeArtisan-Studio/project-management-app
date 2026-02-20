import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Project Management API',
      version: '1.0.0',
      description:
        'Production-ready REST API for the Project Management App.\n\n' +
        '**Authentication:** Use `POST /auth/login` to obtain a JWT token, ' +
        'then click **Authorize** and enter `Bearer <token>`.',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    tags: [
      { name: 'Auth',     description: 'Registration and login' },
      { name: 'Users',    description: 'User profile and admin user management' },
      { name: 'Projects', description: 'Project CRUD and ownership' },
      { name: 'Members',  description: 'Project member management' },
      { name: 'Statuses', description: 'Per-project custom task statuses' },
      { name: 'Tasks',      description: 'Task CRUD within a project' },
      { name: 'Activities', description: 'Audit trail of project, task, and member events' },
      { name: 'Reports',    description: 'Aggregated analytics and KPI endpoints' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without the "Bearer " prefix — the UI adds it).',
        },
      },
      schemas: {
        // ─── Enums ────────────────────────────────────────────
        Role: {
          type: 'string',
          enum: ['ADMIN', 'MAINTAINER', 'MEMBER'],
          description: 'User role. MAINTAINER can own projects; MEMBER can be added to projects.',
        },
        ProjectStatus: {
          type: 'string',
          enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'],
        },
        ActivityAction: {
          type: 'string',
          enum: [
            'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_ARCHIVED',
            'PROJECT_COMPLETED', 'PROJECT_DELETED',
            'MEMBER_ADDED', 'MEMBER_REMOVED',
            'TASK_CREATED', 'TASK_UPDATED', 'TASK_STATUS_CHANGED',
            'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_DELETED',
            'STATUS_CREATED', 'STATUS_UPDATED', 'STATUS_DELETED',
          ],
          description: 'The type of event that was recorded.',
        },

        // ─── Pagination ───────────────────────────────────────
        PaginationMeta: {
          type: 'object',
          required: ['total', 'page', 'limit', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
          properties: {
            total:           { type: 'integer', example: 42 },
            page:            { type: 'integer', example: 1 },
            limit:           { type: 'integer', example: 10 },
            totalPages:      { type: 'integer', example: 5 },
            hasNextPage:     { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },

        // ─── API Response wrappers ────────────────────────────
        ApiSuccessResponse: {
          type: 'object',
          required: ['status'],
          properties: {
            status:  { type: 'string', enum: ['success'], example: 'success' },
            message: { type: 'string', example: 'Operation completed successfully.' },
            data:    { description: 'Response payload (shape varies per endpoint).' },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status:  { type: 'string', enum: ['fail', 'error'], example: 'fail' },
            message: { type: 'string', example: 'Descriptive error message.' },
          },
        },

        // ─── User ─────────────────────────────────────────────
        User: {
          type: 'object',
          required: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
          properties: {
            id:        { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            email:     { type: 'string', format: 'email', example: 'alice@pma.dev' },
            firstName: { type: 'string', example: 'Alice' },
            lastName:  { type: 'string', example: 'Carter' },
            role:      { $ref: '#/components/schemas/Role' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },

        // ─── Auth ─────────────────────────────────────────────
        AuthData: {
          type: 'object',
          required: ['user', 'token'],
          properties: {
            user:  { $ref: '#/components/schemas/User' },
            token: {
              type: 'string',
              description: 'JWT Bearer token. Include as `Authorization: Bearer <token>` on protected requests.',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },

        // ─── Project ──────────────────────────────────────────
        ProjectOwner: {
          type: 'object',
          required: ['id', 'firstName', 'lastName', 'email'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName:  { type: 'string' },
            email:     { type: 'string', format: 'email' },
          },
        },
        Project: {
          type: 'object',
          required: ['id', 'name', 'status', 'ownerId', 'owner', 'createdAt', 'updatedAt'],
          properties: {
            id:          { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'E-Commerce Platform' },
            description: { type: 'string', nullable: true, example: 'Full-stack e-commerce solution.' },
            status:      { $ref: '#/components/schemas/ProjectStatus' },
            ownerId:     { type: 'string', format: 'uuid' },
            owner:       { $ref: '#/components/schemas/ProjectOwner' },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' },
          },
        },

        // ─── Project Member ───────────────────────────────────
        MemberUser: {
          type: 'object',
          required: ['id', 'firstName', 'lastName', 'email', 'role'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName:  { type: 'string' },
            email:     { type: 'string', format: 'email' },
            role:      { $ref: '#/components/schemas/Role' },
          },
        },
        ProjectMember: {
          type: 'object',
          required: ['id', 'projectId', 'userId', 'createdAt', 'user'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            userId:    { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            user:      { $ref: '#/components/schemas/MemberUser' },
          },
        },

        // ─── Task Status ──────────────────────────────────────
        TaskStatus: {
          type: 'object',
          required: ['id', 'projectId', 'name', 'order', 'createdAt', 'updatedAt'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            name:      { type: 'string', example: 'IN_PROGRESS' },
            color:     { type: 'string', nullable: true, example: '#3B82F6', description: 'Hex color code.' },
            order:     { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─── Task ─────────────────────────────────────────────
        Task: {
          type: 'object',
          required: ['id', 'projectId', 'statusId', 'title', 'order', 'createdAt', 'updatedAt', 'status'],
          properties: {
            id:          { type: 'string', format: 'uuid' },
            projectId:   { type: 'string', format: 'uuid' },
            statusId:    { type: 'string', format: 'uuid' },
            assigneeId:  { type: 'string', format: 'uuid', nullable: true },
            title:       { type: 'string', example: 'Integrate Stripe payment gateway' },
            description: { type: 'string', nullable: true, example: 'Implement checkout flow with Stripe Elements.' },
            order:       { type: 'integer', example: 0 },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' },
            status:      { $ref: '#/components/schemas/TaskStatus' },
            assignee:    { allOf: [{ $ref: '#/components/schemas/User' }], nullable: true },
          },
        },

        // ─── Activity ─────────────────────────────────────────
        ActivityUser: {
          type: 'object',
          required: ['id', 'firstName', 'lastName', 'email'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName:  { type: 'string' },
            email:     { type: 'string', format: 'email' },
          },
        },
        Activity: {
          type: 'object',
          required: ['id', 'projectId', 'userId', 'action', 'createdAt', 'user'],
          properties: {
            id:        { type: 'string', format: 'uuid' },
            projectId: { type: 'string', format: 'uuid' },
            userId:    { type: 'string', format: 'uuid' },
            action:    { $ref: '#/components/schemas/ActivityAction' },
            metadata: {
              type: 'object',
              nullable: true,
              additionalProperties: true,
              description: 'Contextual data about the event. Shape varies by action type.',
              example: {
                taskId:       'd4e5f6a7-b8c9-0123-defa-234567890123',
                taskTitle:    'Integrate Stripe payment gateway',
                fromStatusId: 'e5f6a7b8-c9d0-1234-efab-345678901234',
                toStatusId:   'f6a7b8c9-d0e1-2345-fabc-456789012345',
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            user:      { $ref: '#/components/schemas/ActivityUser' },
          },
        },

        // ─── Report schemas ───────────────────────────────────
        TaskStatusCount: {
          type: 'object',
          required: ['statusName', 'count'],
          properties: {
            statusName: { type: 'string', example: 'IN_PROGRESS' },
            count:      { type: 'integer', example: 12 },
          },
        },
        SummaryReport: {
          type: 'object',
          required: ['totalProjects', 'totalTasks', 'tasksByStatus', 'tasksCompletedThisWeek', 'tasksCreatedLast30Days'],
          properties: {
            totalProjects:          { type: 'integer', example: 8 },
            totalTasks:             { type: 'integer', example: 142 },
            tasksByStatus: {
              type: 'array',
              items: { $ref: '#/components/schemas/TaskStatusCount' },
            },
            tasksCompletedThisWeek: { type: 'integer', example: 7 },
            tasksCreatedLast30Days: { type: 'integer', example: 29 },
          },
        },
        ProjectTaskBreakdown: {
          type: 'object',
          required: ['projectId', 'projectName', 'total', 'byStatus'],
          properties: {
            projectId:   { type: 'string', format: 'uuid' },
            projectName: { type: 'string', example: 'E-Commerce Platform' },
            total:       { type: 'integer', example: 18 },
            byStatus: {
              type: 'array',
              items: { $ref: '#/components/schemas/TaskStatusCount' },
            },
          },
        },
        AssigneeTaskBreakdown: {
          type: 'object',
          required: ['assigneeId', 'assigneeName', 'total', 'byStatus'],
          properties: {
            assigneeId:   { type: 'string', format: 'uuid', nullable: true },
            assigneeName: { type: 'string', nullable: true, example: 'Alice Carter' },
            total:        { type: 'integer', example: 11 },
            byStatus: {
              type: 'array',
              items: { $ref: '#/components/schemas/TaskStatusCount' },
            },
          },
        },
        ActivityDataPoint: {
          type: 'object',
          required: ['date', 'count'],
          properties: {
            date:  { type: 'string', format: 'date', example: '2025-06-17', description: 'Start of the time bucket (YYYY-MM-DD, UTC).' },
            count: { type: 'integer', example: 12 },
          },
        },
        CompletionRateReport: {
          type: 'object',
          required: ['totalTasks', 'completedTasks', 'completionRate'],
          properties: {
            totalTasks:     { type: 'integer', example: 142 },
            completedTasks: { type: 'integer', example: 35 },
            completionRate: { type: 'number', format: 'float', example: 24.65, description: 'Percentage 0–100, rounded to 2 decimal places.' },
          },
        },

        // ─── Paginated response shapes ─────────────────────────
        PaginatedUsers: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        PaginatedProjects: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        PaginatedTasks: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
        PaginatedActivities: {
          type: 'object',
          required: ['data', 'meta'],
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
            meta: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
      },

      // ─── Reusable responses ─────────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Missing or invalid JWT token.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              example: { status: 'fail', message: 'No token provided.' },
            },
          },
        },
        Forbidden: {
          description: 'Authenticated but insufficient permissions.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              example: { status: 'fail', message: 'You do not have permission to perform this action.' },
            },
          },
        },
        NotFound: {
          description: 'Requested resource does not exist.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              example: { status: 'fail', message: 'Resource not found.' },
            },
          },
        },
        BadRequest: {
          description: 'Validation error — malformed or missing fields.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              example: { status: 'fail', message: 'name: Name is required' },
            },
          },
        },
        Conflict: {
          description: 'Resource conflict — duplicate or constraint violation.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiErrorResponse' },
              example: { status: 'fail', message: 'Email address is already registered.' },
            },
          },
        },
        NoContent: {
          description: 'Operation succeeded with no response body.',
        },
      },
    },
    // Global security — individual endpoints override for public routes
    security: [{ BearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../modules/**/*.swagger.{ts,js}')],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
