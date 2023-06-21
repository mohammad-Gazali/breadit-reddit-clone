import Link from "next/link";
import { useToast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

export const useCustomToasts = () => {
	
	const { toast } = useToast();

	const loginToast = () => {
		const { dismiss } = toast({
			title: "Login required",
			description: "You need to be logged in to do that action.",
			variant: "destructive",
			action: (
				<Link
					href="/sign-in"
                    onClick={() => dismiss()}
					className={buttonVariants({ variant: "outline" })}
				>
					Login
				</Link>
			),
		});
	};

	return {
		loginToast,
	};
};
