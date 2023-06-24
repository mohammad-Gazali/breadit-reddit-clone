import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "../subreddit_page/PostFeed";
import { getAuthSession } from "@/lib/auth";



const GeneralFeed = async () => {

    const session = await getAuthSession();

    const totalPostCount = await db.post.count();

    const posts = await db.post.findMany({
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
    })

    return <PostFeed session={session} totalPostCount={totalPostCount} initialPosts={posts} />
}


export default GeneralFeed;