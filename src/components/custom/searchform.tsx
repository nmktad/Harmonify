"use client";
import { Input } from "../ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { SearchIcon } from "lucide-react";

export default function SearchForm() {
  const session = useSession();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const submitSearch = useMutation({
    mutationKey: ["search"],
    mutationFn: async ({ query }: { query: string }) => {
      const res = await fetch(
        `http://localhost:4231/api/posts/search/${query}`,
        {
          headers: {
            Authorization: `Bearer ${session.data?.tokens.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        toast.error("Something went wrong");
        return;
      }

      return (await res.json()) as Post[];
    },
  });

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <Form {...form}>
        <form
          className="max-w-5xl px-2 mx-auto z-50"
          onSubmit={form.handleSubmit((data) =>
            submitSearch.mutate({ ...data }),
          )}
          ref={formRef}
        >
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="pl-8 ring-1 ring-muted-foreground/20"
                      id="query"
                      type="search"
                      placeholder="Search for posts..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          formRef.current?.requestSubmit();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </>
  );
}