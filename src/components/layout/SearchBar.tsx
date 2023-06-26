"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/Command";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const SearchBar = () => {
	const [input, setInput] = useState("");

	const router = useRouter();

	const pathname = usePathname();

	const commandRef = useRef<HTMLDivElement>(null);

	const {
		data: queryResult,
		refetch,
		isFetched,
		isFetching,
	} = useQuery({
		queryKey: ["search-query"],
		enabled: false,
		queryFn: async () => {
			if (!input) return [];

			const { data } = await axios.get(`/api/search?q=${input}`);

			return data as (Subreddit & {
				_count: Prisma.SubredditCountOutputType;
			})[];
		},
	});

	const request = debounce(() => {
		refetch();
	}, 300);

	const debounceRequest = useCallback(() => {
		request();
	}, []);

	useOnClickOutside(commandRef, () => {
		setInput("");
	});

	useEffect(() => {
		setInput("");
	}, [pathname])

	return (
		<Command
			ref={commandRef}
			className="relative rounded-lg border max-w-lg z-50 overflow-visible"
		>
			<CommandInput
				value={input}
				className="outline-none border-none focus:border-none focus:outline-none ring-0"
				onValueChange={(text) => {
					setInput(text);
					debounceRequest();
				}}
				placeholder="Search communinties..."
			/>
			{input.length > 0 ? (
				<CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
					{isFetched && <CommandEmpty>No results found.</CommandEmpty>}
					{(queryResult?.length ?? 0) > 0 ? (
						<CommandGroup heading="Communities">
							{queryResult?.map((subreddit) => (
								<CommandItem
									key={subreddit.id}
									value={subreddit.name}
									onSelect={(value) => {
										router.push(`/r/${value}`);
										router.refresh();
									}}
								>
									<Users className="mr-2 h-4 w-4" />
									<a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
								</CommandItem>
							))}
						</CommandGroup>
					) : null}
				</CommandList>
			) : null}
		</Command>
	);
};

export default SearchBar;
