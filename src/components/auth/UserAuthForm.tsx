"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Icons } from "../common/Icons";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";



const UserAuthForm = () => {

	const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

	const loginWithGoogle = async () => {
        setIsLoading(true);

        try {
            await signIn("github");
        } catch (error) {
            toast({
                title: 'Error',
                description: 'There was an error logging in with Google',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false);
        }
    };

	return (
		<div className="flex justify-center">
			<Button
				isLoading={isLoading}
				type="button"
				size="sm"
				className="w-full"
				onClick={loginWithGoogle}
				disabled={isLoading}
			>
				{isLoading ? null : <Icons.github className="h-4 w-4 me-2" />}
				Github
			</Button>
		</div>
	);
};

export default UserAuthForm;
