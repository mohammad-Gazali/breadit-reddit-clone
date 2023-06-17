"use client";

import SignUp from "@/components/auth/SignUp";
import CloseModalDouble from "@/components/common/CloseModalDouble";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {

        // double back
				router.back();
        router.back();

				document.removeEventListener("keydown", handleKeyDown);
			}
		};

		document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
	}, []);

	return (
		<div
			onClick={() => {
        // double back 
        router.back();
        router.back();
      }}
			className="fixed inset-0 bg-zinc-900/20 z-10 cursor-pointer"
		>
			<div className="container flex items-center h-full max-w-lg mx-auto">
				<div
					onClick={(e) => e.stopPropagation()}
					className="relative bg-white w-full h-fit py-20 px-2 rounded-lg cursor-default"
				>
					<div className="absolute top-4 right-4">
						<CloseModalDouble />
					</div>
					<SignUp />
				</div>
			</div>
		</div>
	);
};

export default Page;
