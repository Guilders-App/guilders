import { getApiDocs } from "@/apps/web/lib/swagger";
import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  spec: {
    content: await getApiDocs(),
  },
};

export const GET = ApiReference(config);
