import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/votes";
import { CachedPost } from "@/types/redis";
import { ZodError } from "zod";



const CACHE_AFTER_UPVOTE = 1;

export async function PATCH(req: Request) {
    try {
        
        const session = await getAuthSession();

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        const { postId, voteType } = PostVoteValidator.parse(body);

        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                author: true,
                votes: true,
            }
        })

        if (!post) {
            return new Response("Post not found.", { status: 404 });
        }

        const existingVote = await db.vote.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId,
                }
            }
        });

        if (existingVote) {
            if (existingVote.type === voteType) {

                await db.vote.delete({
                    where: {
                        userId_postId: {
                            userId: session.user.id,
                            postId,
                        }
                    }
                });

                // recount the votes
                const votesAmount = post.votes.reduce((acc, vote) => {
                    if (vote.type === "UP") return acc + 1;
                    if (vote.type === "DOWN") return acc - 1;
                    return acc;
                }, 0);

                if (votesAmount >= CACHE_AFTER_UPVOTE) {
                    const cachePayload = {
                        id: post.id,
                        title: post.title,
                        currentVote: voteType,
                        createdAt: post.createdAt,
                        content: JSON.stringify(post.content),
                        authorUsername: post.author.username ?? "",
                    } satisfies CachedPost;

                    await redis.hset(`post:${postId}`, cachePayload);
                }

                return new Response("Vote was deleted successfully");

            } else {

                await db.vote.update({
                    where: {
                        userId_postId: {
                            userId: session.user.id,
                            postId,
                        }
                    },
                    data: {
                        type: voteType,
                    }
                });

                // recount the votes
                const votesAmount = post.votes.reduce((acc, vote) => {
                    if (vote.type === "UP") return acc + 1;
                    if (vote.type === "DOWN") return acc - 1;
                    return acc;
                }, 0);

                if (votesAmount >= CACHE_AFTER_UPVOTE) {
                    const cachePayload = {
                        id: post.id,
                        title: post.title,
                        currentVote: voteType,
                        createdAt: post.createdAt,
                        content: JSON.stringify(post.content),
                        authorUsername: post.author.username ?? "",
                    } satisfies CachedPost;

                    await redis.hset(`post:${postId}`, cachePayload);
                }

                return new Response("Vote type was changed successfully");

            }
        }

        await db.vote.create({
            data: {
                postId,
                type: voteType,
                userId: session.user.id,
            }
        });

        // recount the votes
        const votesAmount = post.votes.reduce((acc, vote) => {
            if (vote.type === "UP") return acc + 1;
            if (vote.type === "DOWN") return acc - 1;
            return acc;
        }, 0);

        if (votesAmount >= CACHE_AFTER_UPVOTE) {
            const cachePayload = {
                id: post.id,
                title: post.title,
                currentVote: voteType,
                createdAt: post.createdAt,
                content: JSON.stringify(post.content),
                authorUsername: post.author.username ?? "",
            } satisfies CachedPost;

            await redis.hset(`post:${postId}`, cachePayload);
        }

        return new Response("Vote was submitted successfully");

    } catch (error) {
        
        if (error instanceof ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Could not handle vote process", { status: 500 });

    }
}