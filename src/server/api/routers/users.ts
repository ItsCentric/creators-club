import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type SimplifiedUser = {
  id: string;
  profilePictureUrl: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isSelf: boolean;
};

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
  getUser: publicProcedure
    .input(z.string())
    .query(async ({ input: userId, ctx }) => {
      const clerkUser = await clerkClient.users.getUser(userId);
      if (clerkUser.username === null)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User of ID ${userId} does not exist`,
        });
      const dbUser = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: clerkUser.id,
        },
      });

      const userData = {
        ...dbUser,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        profilePictureUrl: clerkUser.imageUrl,
      };

      return userData;
    }),
  createUser: privateProcedure.mutation(async ({ ctx }) => {
    const dbUser = await ctx.prisma.user.create({
      data: {
        id: ctx.userId,
      },
    });

    return dbUser;
  }),
  followUser: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: userIdToFollow }) => {
      await ctx.prisma.user.update({
        where: { id: userIdToFollow },
        data: {
          followers: {
            connect: {
              id: ctx.userId,
            },
          },
        },
      });
    }),
  getFollowers: publicProcedure
    .input(z.string())
    .query(async ({ input: queriedUserId, ctx }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: queriedUserId },
        include: { followers: true },
      });
      const followers = user.followers;
      if (followers.length === 0) return [];
      const clerkFollowers = await clerkClient.users.getUserList({
        userId: followers.map((follower) => follower.id),
      });
      const followersData = clerkFollowers.map((follower) => {
        if (!follower.username)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `User of ID ${follower.id} does not have a username`,
          });
        const simplifiedFollowing: SimplifiedUser = {
          id: follower.id,
          profilePictureUrl: follower.imageUrl,
          username: follower.username,
          firstName: follower.firstName,
          lastName: follower.lastName,
          isSelf: follower.id === ctx.userId,
        };

        return simplifiedFollowing;
      });

      return followersData;
    }),
  getFollowing: publicProcedure
    .input(z.string())
    .query(async ({ input: queriedUserId, ctx }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: queriedUserId },
        include: { following: true },
      });
      const following = user.following;
      if (following.length === 0) return [];
      const clerkFollowing = await clerkClient.users.getUserList({
        userId: following.map((follower) => follower.id),
      });
      const followingData = clerkFollowing.map((following) => {
        if (!following.username)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `User of ID ${following.id} does not have a username`,
          });
        const simplifiedFollowing: SimplifiedUser = {
          id: following.id,
          profilePictureUrl: following.imageUrl,
          username: following.username,
          firstName: following.firstName,
          lastName: following.lastName,
          isSelf: following.id === ctx.userId,
        };

        return simplifiedFollowing;
      });

      return followingData;
    }),
  isFollowing: privateProcedure
    .input(z.string())
    .query(async ({ input: queriedUserId, ctx }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: queriedUserId },
        include: { followers: true },
      });

      return user.followers.map((follower) => follower.id).includes(ctx.userId);
    }),
  unfollowUser: privateProcedure
    .input(z.string())
    .mutation(async ({ input: userIdToUnfollow, ctx }) => {
      await ctx.prisma.user.update({
        where: {
          id: userIdToUnfollow,
        },
        data: {
          followers: {
            disconnect: {
              id: ctx.userId,
            },
          },
        },
      });
    }),
});
