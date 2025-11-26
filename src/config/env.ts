import dotenv from "dotenv";

export interface AppConfig {
    iv: string;
    port: number;
    myEmail: string;
    nodeEnv: string;
    mongoUri: string;
    jwtSecret: string;
    originMain: string;
    myPassword: string;
    tokenSecret: string;
    originAdmin: string;
    encryptionKey: string;
    tokenExpiryTime: string;
    refreshTokenSecret: string;
    refreshTokenExpiryTime: string;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

// Load the appropriate .env file, mirroring the existing index.js behavior
dotenv.config({ path: `.env.${nodeEnv}` });

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but was not provided`);
    }


    return value;
}



const config: AppConfig = {
    nodeEnv,
    iv: getRequiredEnv("IV_TS"),
    port: Number(process.env.PORT_TS),
    myEmail: getRequiredEnv("MY_EMAIL_TS"),
    mongoUri: getRequiredEnv("MONGO_URI_TS"),
    jwtSecret: getRequiredEnv("JWT_SECRET_TS"),
    originMain: getRequiredEnv("ORIGIN_LINK_TS_MAIN"),
    myPassword: getRequiredEnv("MY_PASSWORD_TS"),
    tokenSecret: getRequiredEnv("TOKEN_SECRECT_TS"),
    originAdmin: getRequiredEnv("ORIGIN_LINK_TS_ADMIN"),
    encryptionKey: getRequiredEnv("ENCRYPTION_KEY_TS"),
    tokenExpiryTime: getRequiredEnv("TOKEN_EXPIRY_TIME_TS"),
    refreshTokenSecret: getRequiredEnv("REFRESH_TOKEN_SECRET_TS"),
    refreshTokenExpiryTime: getRequiredEnv("REFRESH_TOKEN_EXPIRY_TIME_TS"),

};

export default config;