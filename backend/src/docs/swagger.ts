import swaggerJSDoc from "swagger-jsdoc";
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Receipt Verification API",
      version: "1.0.0",
      description:
        "Public API for verifying Ethiopian bank receipts (CBE, Telebirr, Abyssinia)",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },

  apis: ["./src/modules/**/*.ts"],
});
