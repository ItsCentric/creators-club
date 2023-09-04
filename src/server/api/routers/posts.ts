import { clerkClient } from "@clerk/nextjs";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

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
        include: {
          media: true,
          previousEdits: {
            orderBy: {
              createdAt: "desc",
            },
          },
          likes: {
            where: {
              id: ctx.userId ?? "",
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
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
        const { likes, _count, ...restOfPost } = post;

        return {
          ...restOfPost,
          likedByUser: likes.some((userLike) => userLike.id === ctx.userId),
          likeCount: _count.likes,
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
        media: z.optional(
          z.array(
            z.object({
              id: z.string(),
              url: z.string(),
              type: z.enum(["IMAGE", "VIDEO"]),
              format: z.string(),
            })
          )
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          media: {
            create: input.media,
          },
          authorId: ctx.userId,
        },
      });

      return post;
    }),

  editPost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().trim().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const oldPost = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        include: {
          media: true,
        },
      });

      if (!oldPost) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (oldPost.authorId !== ctx.userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      const post = await ctx.prisma.post.update({
        where: {
          id: input.postId,
        },
        data: {
          content: input.content,
          previousEdits: {
            create: { content: oldPost.content },
          },
        },
      });

      return post;
    }),

  deletePost: privateProcedure
    .input(
      z.object({
        postData: z.object({ postId: z.string(), authorId: z.string() }),
        media: z.optional(
          z.array(
            z.object({ id: z.string(), url: z.string(), postId: z.string() })
          )
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postData, media } = input;
      if (postData.authorId !== ctx.userId)
        throw new TRPCError({ code: "FORBIDDEN" });

      if (media) {
        for (const mediaItem of media) {
          await ctx.s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET ?? "",
              Key: mediaItem.url.split("aws.com/").pop(),
            })
          );
        }
      }

      await ctx.prisma.post.delete({
        where: {
          id: postData.postId,
        },
      });

      return true;
    }),

  generatePostMediaUploadUrl: privateProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input: fileTypeInput }) => {
      const fileTypes = fileTypeInput.map((fileType) => {
        const fileExtension = fileType.split("/").pop();
        if (!fileExtension)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return fileExtension;
      });
      if (!fileTypes) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const urls = await Promise.all(
        fileTypes.map(async (fileType, i) => {
          const Key = `${ctx.userId}/${randomUUID()}.${fileType}`;

          const s3Parameters = {
            Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET ?? "",
            Key,
            ContentType: fileTypeInput[i],
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
        })
      );

      return urls;
    }),

  likePost: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: postId }) => {
      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likes: {
            connect: {
              id: ctx.userId,
            },
          },
        },
      });
    }),
  unlikePost: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: postId }) => {
      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          likes: {
            disconnect: {
              id: ctx.userId,
            },
          },
        },
      });
    }),
  getPostLikes: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: postId }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          likes: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!post) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (post.likes.length === 0) return [];
      const likedByClerkUsers = await clerkClient.users.getUserList({
        userId: post.likes.map((like) => like.id),
      });

      return likedByClerkUsers.map((user) => ({
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      }));
    }),
});
