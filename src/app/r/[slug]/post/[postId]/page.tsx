import PostVoteShell from "@/components/post_vote/PostVoteShell";
import PostVoteServer from "@/components/post_vote/PostVoteServer";
import EditorOutput from "@/components/subreddit_page/EditorOutput";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CommentsSection from "@/components/post_page/CommentsSection";

interface PageProps {
	params: {
		postId: string;
	};
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// TODO: add generateStaticParams

const Page = async ({ params }: PageProps) => {
	const cachedPost = (await redis.hgetall(
		`post:${params.postId}`
	)) as unknown as CachedPost;

	let post: (Post & { author: User; votes: Vote[] }) | null = null;

	if (!cachedPost) {
		post = await db.post.findUnique({
			where: {
				id: params.postId,
			},
			include: {
				votes: true,
				author: true,
			},
		});

		if (!post) return notFound();
	}

	return (
		<div>
			<div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
				<Suspense fallback={<PostVoteShell />}>
					{/* @ts-expect-error server component */}
					<PostVoteServer
						postId={post?.id ?? cachedPost.id}
						getData={async () => {
							return await db.post.findUnique({
								where: {
									id: params.postId,
								},
								include: {
									votes: true,
								},
							});
						}}
					/>
				</Suspense>

				<div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
					<p className="max-h-40 mt-1 truncate text-xs text-gray-500">
						Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
						{formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
					</p>
					<h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
						{post?.title ?? cachedPost.title}
					</h1>
					<EditorOutput content={post?.content ?? cachedPost.content} />
					<Suspense
						fallback={
							<Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
						}
					>
						{/* @ts-expect-error server component */}
						<CommentsSection postId={post?.id ?? cachedPost.id} />
					</Suspense>
				</div>
			</div>
		</div>
	);
};

export default Page;
