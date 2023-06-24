"use client";

import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { Session } from "next-auth";
import Post from "../common/Post";

interface PostFeedProps {
	initialPosts: ExtendedPost[];
	totalPostCount: number;
	subredditName?: string;
	session: Session | null;
}

const PostFeed: FC<PostFeedProps> = ({
	initialPosts,
	totalPostCount,
	subredditName,
	session,
}) => {
	const lastPostRef = useRef<HTMLElement>(null);

	const { ref, entry } = useIntersection({
		root: lastPostRef.current,
		threshold: 1,
	});

	const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
		queryKey: ["infinite-query"],
		queryFn: async ({ pageParam = 1 }) => {
			const queryEndpoint = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}${
				Boolean(subredditName) ? `&subredditName=${subredditName}` : ""
			}`;

			const { data } = await axios.get(queryEndpoint);

			return data as ExtendedPost[];
		},
		getNextPageParam: (_lastPage, allPages) => {
			return allPages.length + 1;
		},
		initialData: {
			pages: [initialPosts],
			pageParams: [1],
		},
	});

	useEffect(() => {
		if (entry?.isIntersecting) {
			fetchNextPage();
		}
	}, [entry, fetchNextPage]);

	const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

	return (
		<ul className="flex flex-col col-span-2 space-y-6">
			{posts.map((post, index) => {
				const votesAmount = post.votes.reduce((acc, vote) => {
					if (vote.type === "UP") return acc + 1;
					if (vote.type === "DOWN") return acc - 1;
					return acc;
				}, 0);

				const currentVote = post.votes.find(
					(post) => post.userId === session?.user.id
				);

				if (index === posts.length - 1 && posts.length < totalPostCount) {
					return (
						<li key={post.id} ref={ref}>
							<Post
								post={post}
								votesAmount={votesAmount}
                                currentVote={currentVote}
								subredditName={post.subreddit.name}
							/>
						</li>
					);
				}

				return (
					<li key={post.id}>
						<Post
							post={post}
							votesAmount={votesAmount}
                            currentVote={currentVote}
							subredditName={post.subreddit.name}
						/>
					</li>
				);
			})}
		</ul>
	);
};

export default PostFeed;
