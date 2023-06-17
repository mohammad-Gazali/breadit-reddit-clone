import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";



export const metadata = {
	title: "Breadit",
	description: "A Reddit clone built with Next.js and TypeScript.",
};

const inter = Inter({
	subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(
				"bg-white text-slate-900 antialiased light",
				inter.className
			)}
		>
			<body className="min-h-screen pt-12 bg-slate-50 antialiased">
				<Navbar />
				<main className="container max-w-7xl mx-auto h-full pt-12">
					{children}
				</main>
			</body>
		</html>
	);
}