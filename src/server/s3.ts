import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

const globalForS3Client = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

export const s3Client =
  globalForS3Client.s3Client ??
  new S3Client({
    apiVersion: "2006-03-01",
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    logger: env.NODE_ENV === "production" ? undefined : console,
  });

if (env.NODE_ENV !== "production") globalForS3Client.s3Client = s3Client;
