"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type EditorJs from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/Button";



interface EditorProps {
	subredditId: string;
}

const Editor: FC<EditorProps> = ({ subredditId }) => {

    const [isMounted, setIsMounted] = useState(false);

    const ref = useRef<EditorJs>();
    const _titleRef = useRef<HTMLTextAreaElement>(null);

    const { toast } = useToast();

    const pathname = usePathname();

    const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PostCreationRequest>({
		resolver: zodResolver(PostValidator),
		defaultValues: {
			subredditId,
			title: "",
			content: null,
		},
	});

    const initializeEditor = useCallback(async () => {
        const EditorJs = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const Embed = (await import("@editorjs/embed")).default;
        const Table = (await import("@editorjs/table")).default;
        const List = (await import("@editorjs/list")).default;
        const Code = (await import("@editorjs/code")).default;
        const LinkTool = (await import("@editorjs/link")).default;
        const InlineCode = (await import("@editorjs/inline-code")).default;
        const ImageTool = (await import("@editorjs/image")).default;

        if (!ref.current) {
            const editor = new EditorJs({
                holder: "editor",
                placeholder: "Type here to write your post...",
                inlineToolbar: true,
                data: {
                    blocks: [],
                },
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: "/api/link",
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file: File) => {
                                    const [res] = await uploadFiles([file], "imageUploader");

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl,
                                        }
                                    }
                                }
                            }
                        }
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    embed: Embed,
                    table: Table,
                },
                onReady: () => {
                    ref.current = editor;
                },
            });
        }
    }, []);


    useEffect(() => {
        // this condition make sure if we at client side
        if (typeof window !== "undefined") {
            setIsMounted(true);
        }
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length) {
            //? the "_" below is the key that is relative to the value
            //? this for loop is equivalent to python for "for key, value in dictionary.items():"
            for (const [_, value] of Object.entries(errors)) {
                const description = value.message as string;
                toast({
                    title: "Something went wrong",
                    description,
                    variant: "destructive",
                });
            }
        }
    }, [errors]);

    useEffect(() => {
        const init = async () => {
            await initializeEditor();

            _titleRef.current?.focus();
        };

        if (isMounted) {
            init();

            return () => {
                ref.current?.destroy();
            };
        }
    }, [isMounted, initializeEditor]);

    const { mutate: createPost, isLoading } = useMutation({
        mutationFn: async (data: PostCreationRequest) => {
            const payload: PostCreationRequest = data;

            const { data: responseData } = await axios.post("/api/subreddit/post/create", payload);

            return responseData;
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "Your post was not published, please try again later.",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            const newPathname = pathname.split("/").slice(0, -1).join("/");

            router.push(newPathname);

            router.refresh();

            toast({
                title: "Success",
                description: "Your post has been published.",
            })
        }
    });

    const onSubmit = async (data: PostCreationRequest) => {
        const blocks = await ref.current?.save();

        const payload: PostCreationRequest = {
            title: data.title,
            content: blocks,
            subredditId,
        };

        createPost(payload);
    }

    const { ref: titleRef, ...restTitleProps } = register("title");

	return (
		<>
            <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <form id="subreddit-post-form" className="w-fit" onSubmit={handleSubmit(onSubmit)}>
                    <div className="prose prose-stone">
                        <TextareaAutosize
                            ref={(e) => {
                                titleRef(e);

                                // @ts-ignore
                                _titleRef.current = e;
                            }}
                            {...restTitleProps}
                            placeholder="Title"
                            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
                        />
                    </div>
                    <div id="editor" className="min-h-[500px]" />
                </form>
		    </div>
            <div className="w-full flex justify-end">
                <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
                form="subreddit-post-form"
                >
                    Post
                </Button>
            </div>
        </>
	);
};

export default Editor;
