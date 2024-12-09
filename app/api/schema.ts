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
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         date:
 *           type: string
 *           format: date-time
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         account_id:
 *           type: number
 *         provider_transaction_id:
 *           type: string
 *     Institution:
 *       type: object
 *       properties:
 *         provider_id:
 *           type: integer
 *         institution_id:
 *           type: string
 *         name:
 *           type: string
 *         country:
 *           type: string
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
 *     Rate:
 *       type: object
 *       properties:
 *         currency_code:
 *           type: string
 *         rate:
 *           type: number
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Authentication required"
 *             required:
 *               - success
 *               - error
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
