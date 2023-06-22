import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/Toaster";
import Providers from "@/components/Providers";
import "@/styles/globals.css";



export const metadata = {
	title: "Breadit",
	description: "A Reddit clone built with Next.js and TypeScript.",
};

const inter = Inter({
	subsets: ["latin"],
});

export default function RootLayout({ children, authModal }: { children: ReactNode, authModal: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(
				"bg-white text-slate-900 antialiased light",
				inter.className
			)}
		>
			<body className="min-h-screen pt-12 bg-slate-50 antialiased">
				<Providers>
					{/* @ts-expect-error server component */}
					<Navbar />
					{authModal}
					<main className="container max-w-7xl mx-auto h-full pt-12">
						{children}
					</main>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
