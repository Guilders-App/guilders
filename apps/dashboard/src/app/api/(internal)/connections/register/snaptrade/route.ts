import { providerName } from "@/lib/providers/snaptrade/client";
import { registerSnapTradeUser } from "@/lib/providers/snaptrade/register";
import { registerConnection } from "../../common";

/**
 * @swagger
 * /api/connections/register/snaptrade:
 *   post:
 *     tags:
 *       - Connections
 *     summary: Register SnapTrade connection for the user
 *     description: |
 *       Register SnapTrade connection for the authenticated user.
 *       This is only necessary for providers that require registration.
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully registered connections
 */
export async function POST() {
  return registerConnection(providerName, registerSnapTradeUser);
}
