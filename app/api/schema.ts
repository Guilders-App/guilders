/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [asset, liability]
 *         subtype:
 *           type: string
 *         value:
 *           type: number
 *         currency:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Institution:
 *       type: object
 *       properties:
 *         provider_id:
 *           type: integer
 *         institution_id:
 *           type: string
 *         name:
 *           type: string
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *         enabled:
 *           type: boolean
 *         logo_url:
 *           type: string
 *     Provider:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         logo_url:
 *           type: string
 *   responses:
 *     UnauthorizedError:
 *       description: Invalid credentials
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               error:
 *                 type: string
 *                 example: "Invalid credentials"
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               error:
 *                 type: string
 *                 example: "Server error"
 */

export {};
