import MiniCreatePost from "@/components/subreddit_page/MiniCreatePost";
import PostFeed from "@/components/subreddit_page/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";



// TODO: add generateStaticParams

interface PageProps {
    params: {
        slug: string;
    }
}

const Page = async ({ params }: PageProps) => {

    const { slug } = params;

    const session = await getAuthSession();

    const totalPostCount = await db.post.count({
        where: {
            subreddit: {
                name: slug,
            }
        }
    });

    const subreddit = await db.subreddit.findUnique({
        where: {
            name: slug,
        },
        include: {
            posts: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true,
                },
                take: INFINITE_SCROLLING_PAGINATION_RESULTS,
            }
        },
    });

    if (!subreddit) return notFound();
    
    return (
        <>
            <h1 className='font-bold text-3xl md:text-4xl h-14'>
                r/{subreddit.name}
            </h1>
            <MiniCreatePost session={session} />
            <PostFeed
            totalPostCount={totalPostCount}
            initialPosts={subreddit.posts}
            session={session}
            subredditName={subreddit.name}
            />
        </>
    )
}

export default Page;