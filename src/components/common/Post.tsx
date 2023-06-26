import { formatTimeToNow } from "@/lib/utils";
import { ExtendedPost } from "@/types/db";
import { MessageSquare } from "lucide-react";
import { FC, useRef } from "react";
import EditorOutput from "../subreddit_page/EditorOutput";
import PostVoteClient from "../post_vote/PostVoteClient";
import { Vote } from "@prisma/client";


type PartialVote = Pick<Vote, "type">;

interface PostProps {
	subredditName: string;
    post: ExtendedPost;
    votesAmount: number;
    currentVote?: PartialVote;
}

const Post: FC<PostProps> = ({ subredditName, post, votesAmount, currentVote }) => {

    const postRef = useRef<HTMLDivElement>(null);

	return (
		<div className="rounded-md bg-white shadow">
			<div className="px-6 py-4 flex justify-between">
				<PostVoteClient 
                postId={post.id}
                initialVotesAmount={votesAmount}
                initialVote={currentVote?.type}
                />

				<div className="w-0 flex-1">
					<div className="max-h-40 mt-1 text-xs text-gray-500">
						<a
							className="underline text-zinc-900 text-sm underline-offset-2"
							href={`/r/${subredditName}`}
						>
							r/{subredditName}
						</a>
                        <span className="px-1">●</span>
                        <span>Posted by u/{post.author.username}</span>{" "}
                        {formatTimeToNow(new Date(post.createdAt))}
					</div>
                    <a href={`/r/${subredditName}/post/${post.id}`}>
                        <h3 className="text-lg/6 font-semibold py-2 text-gray-900">
                            {post.title}
                        </h3>
                    </a>
                    <div
                    ref={postRef} 
                    className="relative text-sm max-h-40 w-full overflow-clip"
                    >
                        <EditorOutput
                        content={post.content}
                        />
                        {postRef.current?.clientHeight === 160 ? (
                            <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
                        ): null}
                    </div>
				</div>
			</div>

            <div className="bg-gray-50 z-20 text-sm sm:px-6 p-4 rounded-b-lg">
                <a className="w-fit flex items-center gap-2" href={`/r/${subredditName}/post/${post.id}`}>
                    <MessageSquare className="h-4 w-4" /> {post.comments.length} comments
                </a>
            </div>

		</div>
	);
};

export default Post;
