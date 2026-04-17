export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      // Pega do ambiente (API_URL ou EXPO_PUBLIC_API_URL) ou usa a versão de produção como fallback (útil pro publish)
      apiUrl: process.env.API_URL || process.env.EXPO_PUBLIC_API_URL || "https://deconta-api.onrender.com/api",
    },
  };
};
