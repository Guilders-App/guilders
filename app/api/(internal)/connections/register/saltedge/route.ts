import { providerName } from "@/lib/providers/saltedge/client";
import { registerSaltEdgeUser } from "@/lib/providers/saltedge/register";
import { registerConnection } from "../../common";

/**
 * @swagger
 * /api/connections/register/saltedge:
 *   post:
 *     tags:
 *       - Connections
 *     summary: Register SaltEdge connection for the user
 *     description: |
 *       Register SaltEdge connection for the authenticated user.
 *       This is only necessary for providers that require registration.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully registered connections
 */
export async function POST(request: Request) {
  return registerConnection(providerName, registerSaltEdgeUser, request);
}
