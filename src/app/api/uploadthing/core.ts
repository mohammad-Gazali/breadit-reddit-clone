//? code is copied form https://docs.uploadthing.com/nextjs/appdir but we edited {req} to req in ".middleware(async (req) => {"


import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();

const auth = () => ({ id: "fakeId" });
 
export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const user = auth();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async () => {

    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;