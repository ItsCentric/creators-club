import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(
      z.object({
        userId: z.optional(z.string()),
        limit: z.number(),
        offset: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: input.limit,
        skip: input.offset,
      });

      const users = await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: input.limit,
        offset: input.offset,
      });

      return posts.map((post) => {
        const user = users.find((user) => user.id === post.authorId);
        if (!user || !user.username || !user.profileImageUrl)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
          });

        return {
          ...post,
          author: {
            username: user.username,
            profileImageUrl: user.profileImageUrl,
          },
        };
      });
    }),

  getPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      return post;
    }),

  createPost: privateProcedure
    .input(
      z.object({
        content: z.string(),
        media: z.optional(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          media: input.media,
          authorId: ctx.userId,
        },
      });

      return post;
    }),
});
