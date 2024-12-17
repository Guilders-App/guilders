import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api/(public)",
    schemaFolders: ["app/api/(public)"],
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Guilders API",
        version: "1.0",
        description:
          "Authentication is required for all endpoints. Use either a Bearer token (for logged-in users) or an API key.",
      },
      components: {
        securitySchemes: {
          // TODO: This is for logged in users and internal endpoints
          // BearerAuth: {
          //   type: "http",
          //   scheme: "bearer",
          //   bearerFormat: "JWT",
          //   description: "JWT token obtained from logging in",
          // },
          ApiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "X-Api-Key",
            description: "API key for programmatic access",
          },
        },
      },
      security: [{ ApiKeyAuth: [] }],
    },
  });
  return spec;
};
