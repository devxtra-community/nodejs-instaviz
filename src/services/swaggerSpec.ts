import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InstaviZ Api documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/**/*.{ts,js}"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
