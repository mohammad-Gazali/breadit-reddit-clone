"use client";

import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";



const CloseModalDouble = () => {
	const router = useRouter();

	return (
		<Button
            onClick={() => {
                // double back 
                router.back();
                router.back();
            }}
			variant="subtle"
			className="w-6 h-6 p-0 rounded-md"
			aria-label="close modal"
		>
			<X className="h-4 w-4" />
		</Button>
	);
};

export default CloseModalDouble;
