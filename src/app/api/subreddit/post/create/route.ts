import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { ZodError } from "zod";



export async function POST(req: Request) {
    try {
        
        const session = await getAuthSession();

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const body = await req.json();

        const { subredditId, title, content } = PostValidator.parse(body);

        const subreddit = await db.subreddit.findUnique({
            where: {
                id: subredditId,
            }
        })

        if (!subreddit) {
            return new Response("Subreddit not found.", { status: 404 });
        }

        const subscriptionExists = await db.subscription.findUnique({
            where: {
                userId_subredditId: {
                    subredditId: subredditId,
                    userId: session.user.id,
                }
            }
        })

        if (!subscriptionExists) {
            return new Response("You should be subscribed to the subreddit first.", { status: 400 });
        }

        await db.post.create({
            data: {
                title,
                content,
                subredditId,
                authorId: session.user.id,
            }
        });

        return new Response("Post has been created successfully");

    } catch (error) {

        if (error instanceof ZodError) {
            return new Response(error.message, { status: 422 });
        }

        return new Response("Could not post to subreddit at this time, please try again later.", { status: 500 });

    }
};