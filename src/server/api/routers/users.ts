import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(z.object({ userIds: z.array(z.string()), limit: z.number() }))
    .query(async ({ input, ctx }) => {
      const clerkUsers = await clerkClient.users.getUserList({
        userId: input.userIds,
        limit: input.limit,
      });
      const clerkUserIds = clerkUsers.map((user) => user.id);
      const dbUsers = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: clerkUserIds,
          },
        },
      });

      return dbUsers;
    }),
  getUser: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const clerkUser = await clerkClient.users.getUser(input);
    const dbUser = await ctx.prisma.user.findUnique({
      where: {
        id: clerkUser.id,
      },
    });

    return dbUser;
  }),
  createUser: privateProcedure.mutation(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.create({
      data: {
        id: ctx.userId,
      },
    });

    return dbUser;
  }),
});
