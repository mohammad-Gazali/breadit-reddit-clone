"use client";

import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { CommentVote, VoteType } from "@prisma/client";
import { FC, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CommentVoteRequest } from "@/lib/validators/votes";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";


type PartialVote = Pick<CommentVote, "type">;

interface CommentVotesProps {
	commentId: string;
	votesAmount: number;
	currentVote?: PartialVote;
}

const CommentVotes: FC<CommentVotesProps> = ({
	commentId,
	votesAmount: _votesAmount,
	currentVote: _currentVote,
}) => {

    const [votesAmount, setVotesAmount] = useState(_votesAmount)
    const [currentVote, setCurrentVote] = useState<PartialVote | undefined>(_currentVote)
    
	const prevVote = useRef(currentVote);

	const { loginToast } = useCustomToasts();

    const { toast } = useToast();

	const { mutate: vote } = useMutation({
		mutationFn: async (voteType: VoteType) => {
			const payload: CommentVoteRequest = {
				commentId,
				voteType,
			};

			await axios.patch("/api/subreddit/post/comment/vote", payload);
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
            if (currentVote?.type === voteType) {
                setCurrentVote(undefined);

                if (voteType === "UP") setVotesAmount(preState => preState - 1);
                else setVotesAmount(preState => preState + 1);

            } else {

                setCurrentVote({ type: voteType });
                
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
		<div className="flex gap-1">
			<Button
				onClick={() => vote("UP")}
				size="sm"
				variant="ghost"
				aria-label="upvote"
			>
				<ArrowBigUp
					className={cn("h-5 w-5 text-zinc-700", {
						"text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
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
						"text-red-500 fill-red-500": currentVote?.type === "DOWN",
					})}
				/>
			</Button>
		</div>
	);
};

export default CommentVotes;
