import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Прежний адрес страницы входа без регистрации: старые ссылки ведут на /try.
const LEGACY_TRY_PATH = "demo";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: `/:locale(ru|kk)/${LEGACY_TRY_PATH}`,
        destination: "/:locale/try",
        permanent: true,
      },
      {
        source: `/${LEGACY_TRY_PATH}`,
        destination: "/try",
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin(
  "./src/shared/configs/i18/request.ts",
);

export default withNextIntl(nextConfig);
