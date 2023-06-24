import { VoteType } from "@prisma/client";



export interface CachedPost {
    id: string;
    title: string;
    authorUsername: string;
    content: string;
    currentVote: VoteType | null;
    createdAt: Date;
}