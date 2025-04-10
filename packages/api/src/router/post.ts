import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { CreatePostSchema } from "@acme/db";

import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany({
      orderBy: {
        id: "desc",
      },
      take: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.post.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.post.create({
        data: input,
      });
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.post.delete({
      where: {
        id: input,
      },
    });
  }),
} satisfies TRPCRouterRecord;
