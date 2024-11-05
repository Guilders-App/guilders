import { providerName } from "@/lib/providers/saltedge/client";
import { deregisterSaltEdgeUser } from "@/lib/providers/saltedge/deregister";
import { deregisterConnection } from "../../common";

/**
 * @swagger
 * /api/connections/deregister/saltedge:
 *   post:
 *     tags:
 *       - Connections
 *     summary: Deregister SaltEdge connection for the user
 *     description: |
 *       Deregister SaltEdge connection for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully deregistered connections
 */
export async function POST(request: Request) {
  return deregisterConnection(providerName, deregisterSaltEdgeUser, request);
}
