"use client";

import { useState } from "react";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { useRouter } from "next/navigation";



interface CreateCommentProps {
	postId: string;
    replyToId?: string;
}

const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {

    const [input, setInput] = useState("");

    const { toast } = useToast();
    const { loginToast } = useCustomToasts();

    const router = useRouter();

    const { mutate: createComment, isLoading } = useMutation({
        mutationFn: async ({ text }: { text: string }) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId,
            };

            const { data } = await axios.patch(`/api/subreddit/post/comment`, payload);

            return data 
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return loginToast()
                }
            }

            toast({
                title: "There was a problem.",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });   
        },
        onSuccess: () => {
            router.refresh();
            setInput("");
        }
    });

	return (
		<div className="grid w-full gap-1.5">
			<Label htmlFor="comment">Your comment</Label>
			<div className="mt-2">
				<Textarea
					id="comment"
					value={input}
					onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder="What are you thoughts ?"
				/>
                <div className="mt-2 flex justify-end">
                    <Button isLoading={isLoading} disabled={isLoading || input.length === 0} onClick={() => createComment({ text: input })}>
                        Post
                    </Button>
                </div>
			</div>
		</div>
	);
};

export default CreateComment;
