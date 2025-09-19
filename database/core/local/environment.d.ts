declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MANAGEMENT_DATABASE_CONNECTION_URL: string;
      DATABASE_CONNECTION_URL: string;
      DATABASE_NAME: string;
      DATABASE_USERS: string;
      DATABASE_PASSWORDS: string;
      DATABASE_SCHEMAS: string;
    }
  }
}

export {};
