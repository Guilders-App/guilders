import { providerName } from "@/lib/providers/snaptrade/client";
import { deregisterSnapTradeUser } from "@/lib/providers/snaptrade/deregister";
import { deregisterConnection } from "../../common";

/**
 * @swagger
 * /api/connections/deregister/snaptrade:
 *   post:
 *     tags:
 *       - Connections
 *     summary: Deregister SnapTrade connection for the user
 *     description: |
 *       Deregister SnapTrade connection for the authenticated user.
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
  return deregisterConnection(providerName, deregisterSnapTradeUser, request);
}
