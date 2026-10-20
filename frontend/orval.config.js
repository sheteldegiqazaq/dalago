require("dotenv").config();

module.exports = {
  api: {
    input:
      process.env.ORVAL_PATH_URL ||
      "../backend/uploads/openapi/openapi-spec.json",
    hooks: {
      afterAllFilesWrite: "biome format --write",
    },
    output: {
      target: "./src/shared/api/generated.ts",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/shared/lib/client/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useInfinite: true,
        },
        mutation: {
          useMutation: true,
        },
      },
    },
  },
};
