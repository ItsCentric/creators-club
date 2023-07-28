import type { NextApiRequest, NextApiResponse } from "next";
import { userRouter } from "~/server/api/routers/users";
import { prisma } from "~/server/db";
import { getAuth } from "@clerk/nextjs/server";
import { s3Client } from "~/server/s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authObject = getAuth(req);
  const userId = authObject.userId;
  if (!userId) return res.redirect(401, "/");
  const userExists =
    (await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })) !== null;
  if (userExists) return res.redirect(304, "/");
  const userCaller = userRouter.createCaller({ prisma, s3Client, userId });
  await userCaller.createUser();
  return res.redirect(200, "/");
}
