import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const postsRouter = createTRPCRouter({
  getPosts: publicProcedure
    .input(
      z.object({
        userId: z.optional(z.string()),
        limit: z.number(),
        cursor: z.optional(z.string()),
      })
    )
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });
      const nextCursor =
        posts.length > input.limit
          ? (posts.pop() as (typeof posts)[number]).id
          : undefined;

      const users = await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: input.limit,
      });

      const mappedPosts = posts.map((post) => {
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

      return {
        posts: mappedPosts,
        nextCursor,
      };
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
        content: z.string().trim().min(1).max(1000),
        media: z.optional(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          media: input.media,
          authorId: ctx.userId,
        },
      });

      return post;
    }),

  generatePostMediaUploadUrl: privateProcedure
    .input(z.string().startsWith("image/"))
    .query(async ({ ctx, input: fileTypeInput }) => {
      const fileType = fileTypeInput.split("/")[1];
      if (!fileType) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const Key = `${ctx.userId}/${randomUUID()}.${fileType}`;

      const s3Parameters = {
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET ?? "",
        Key,
        ContentType: `image/${fileType}`,
      };
      const signedUrl = await getSignedUrl(
        ctx.s3Client,
        new PutObjectCommand(s3Parameters),
        { expiresIn: 60 * 5 }
      );

      return {
        signedUrl,
        key: Key,
      };
    }),
});
