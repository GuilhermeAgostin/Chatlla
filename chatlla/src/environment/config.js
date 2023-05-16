const environmentTypes = {
  DEV: {
    API_URL: "",
    PUBLIC_URL: import.meta.env.PUBLIC_URL_DEV,
  },
  HML: {
    API_URL: "",
    PUBLIC_URL: import.meta.env.PUBLIC_URL_HML,
  },
  PROD: {
    API_URL: "",
    PUBLIC_URL: import.meta.env.PUBLIC_URL_PROD,
  },
};

export const Environment = environmentTypes.PROD;
