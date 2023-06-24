"use client";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { VoteType } from "@prisma/client";
import { FC, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/votes";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";



interface PostVoteClientProps {
	postId: string;
	initialVotesAmount: number;
	initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
	postId,
	initialVotesAmount,
	initialVote,
}) => {
	const [votesAmount, setVotesAmount] = useState(initialVotesAmount);
	const [currentVote, setCurrentVote] = useState(initialVote);

	const prevVote = useRef(currentVote);

	const { loginToast } = useCustomToasts();

    const { toast } = useToast();

	const { mutate: vote } = useMutation({
		mutationFn: async (voteType: VoteType) => {
			const payload: PostVoteRequest = {
				postId,
				voteType,
			};

			await axios.patch("/api/subreddit/post/vote", payload);
		},
        onError: (error, voteType) => {
            if (voteType === "UP") setVotesAmount(preState => preState - 1);
            else setVotesAmount(preState => preState + 1);

            // reset current vote
            setCurrentVote(prevVote.current);

            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return loginToast();
                }
            }

            toast({
                title: "Something went wrong",
                description: "Your vote was not registered, please try again.",
                variant: "destructive",
            })
        },
        onMutate: (voteType) => {
            if (currentVote === voteType) {
                setCurrentVote(undefined);

                if (voteType === "UP") setVotesAmount(preState => preState - 1);
                else setVotesAmount(preState => preState + 1);

            } else {

                setCurrentVote(voteType);
                
                if (currentVote) {
                    if (voteType === "UP") setVotesAmount(preState => preState + 2);
                    else setVotesAmount(preState => preState - 2);
                } else {
                    if (voteType === "UP") setVotesAmount(preState => preState + 1);
                    else setVotesAmount(preState => preState - 1);
                }

            }
        }
	});

	return (
		<div className="flex sm:flex-col sm:gap-0 gap-4 pe-6 sm:w-20 sm:pb-0 pb-4">
			<Button
				onClick={() => vote("UP")}
				size="sm"
				variant="ghost"
				aria-label="upvote"
			>
				<ArrowBigUp
					className={cn("h-5 w-5 text-zinc-700", {
						"text-emerald-500 fill-emerald-500": currentVote === "UP",
					})}
				/>
			</Button>
			<p className="text-center py-2 font-medium text-sm text-zinc-900">
				{votesAmount}
			</p>
			<Button
				onClick={() => vote("DOWN")}
				size="sm"
				variant="ghost"
				aria-label="downvote"
			>
				<ArrowBigDown
					className={cn("h-5 w-5 text-zinc-700", {
						"text-red-500 fill-red-500": currentVote === "DOWN",
					})}
				/>
			</Button>
		</div>
	);
};

export default PostVoteClient;
