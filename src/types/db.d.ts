import { Comment, Post, Subreddit, User, Vote } from "@prisma/client";



export interface ExtendedPost extends Post {
    subreddit: Subreddit;
    votes: Vote[];
    author: User;
    comments: Comment[];
}