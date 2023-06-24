import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "../subreddit_page/PostFeed";
import { getAuthSession } from "@/lib/auth";



const CustomFeed = async () => {

    const session = await getAuthSession();

    const followedComunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id
        },
        include: {
            subreddit: true,
        }
    });
    
    const totalPostCount = await db.post.count({
        where: {
            subreddit: {
                name: {
                    in: followedComunities.map(sub => sub.subreddit.name),
                }
            }
        }
    });

    const posts = await db.post.findMany({
        where: {
            subreddit: {
                name: {
                    in: followedComunities.map(sub => sub.subreddit.name),
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    });

    return <PostFeed session={session} totalPostCount={totalPostCount} initialPosts={posts} />
}


export default CustomFeed;