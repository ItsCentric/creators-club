import { AiOutlineSearch, AiOutlineHome, AiOutlineEdit } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { BsMoon, BsSun, BsTrash } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";
import { Button } from "~/components/ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { useTheme } from "next-themes";

export default function Navbar() {
  return (
    <>
      <nav className="sticky bottom-0 z-10 order-2 flex w-full flex-col gap-2 border-t border-muted bg-background p-4 lg:top-0 lg:order-first lg:h-screen lg:w-fit lg:border-r lg:px-10">
        <div className="mx-auto w-fit">
          <Image
            src="/cclogo.png"
            alt="creators club logo"
            width={64}
            height={64}
            className="mr-2 hidden align-middle lg:inline-block"
          />
          <p className="hidden bg-gradient-to-br from-primary to-secondary bg-clip-text font-cabin text-3xl font-extrabold text-transparent lg:inline-block lg:whitespace-pre-wrap lg:align-middle">
            {"Creators\nClub"}
          </p>
        </div>
        <Separator className="hidden lg:block" />
        <ul className="items-left flex grow justify-evenly gap-4 lg:my-2 lg:flex-col lg:justify-normal lg:gap-0">
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <AiOutlineHome size={32} />
                <p className="hidden font-semibold lg:inline-block">
                  Your Feed
                </p>
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <AiOutlineSearch size={32} />
                <p className="hidden font-semibold lg:inline-block">Search</p>
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <IoChatbubblesOutline size={32} />
                <p className="hidden font-semibold lg:inline-block">
                  Conversations
                </p>
              </Link>
            </Button>
          </li>
          <SignedIn>
            <li>
              <CreatePost />
            </li>
          </SignedIn>
          <li className="order-6 lg:order-5">
            <UserButton />
          </li>
          <li className="order-5 mt-auto lg:order-6">
            <ThemeButton />
          </li>
        </ul>
      </nav>
    </>
  );
}

function ThemeButton() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <Button
      variant="nav"
      size="none"
      className="gap-2"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <BsSun
        size={30}
        className={resolvedTheme === "light" ? "block" : "hidden"}
      />
      <BsMoon
        size={30}
        className={resolvedTheme === "dark" ? "block" : "hidden"}
      />
      <p className="hidden lg:block">{toTitleCase(resolvedTheme ?? "")} Mode</p>
    </Button>
  );
}

function CreatePost() {
  const trpcContext = api.useContext();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema>>();
  const [mediaPreview, setMediaPreview] = useState<File>();
  const [characterCount, setCharacterCount] = useState(0);
  const { toast } = useToast();
  const {
    data: uploadUrlData,
    isFetching: isGeneratingUrl,
    isError: isUrlError,
    error: urlError,
  } = api.posts.generatePostMediaUploadUrl.useQuery(
    formData?.postMedia?.type ?? "",
    {
      enabled: !!formData && !!mediaPreview,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  const { mutate: createPost } = api.posts.createPost.useMutation({
    onSuccess: async () => {
      form.reset();
      setCharacterCount(0);
      setOpen(false);
      await trpcContext.posts.getPosts.invalidate();
      toast({
        title: "Post created",
        description: "Go check out your new post!",
        variant: "success",
      });
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Well, that's embarrassing...",
        description: `Something went wrong while creating your post. Please try again.\n\nCode: ${
          e.data?.code ?? "INTERNAL_SERVER_ERROR"
        }\nMessage: ${e.message}`,
        variant: "destructive",
      });
    },
  });
  const formSchema = z.object({
    postContent: z.string().trim().min(1).max(1000),
    postMedia: z
      .instanceof(File)
      .refine((file) =>
        ["image/png", "image/jpg", "image/jpeg"].includes(file.type)
      )
      .optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postContent: "",
    },
  });

  useEffect(() => {
    async function uploadMedia() {
      if (!formData || isGeneratingUrl) return;
      setFormData(undefined);
      const { postContent, postMedia } = formData;
      if (!postContent) throw new Error("Content is required.");
      if (isUrlError) throw new Error(urlError?.message);
      if (postMedia && uploadUrlData) {
        await axios.put(uploadUrlData.signedUrl, postMedia);
      }
      const mediaUrl = uploadUrlData?.key
        ? `https://${
            process.env.NEXT_PUBLIC_AWS_BUCKET ?? ""
          }.s3.amazonaws.com/${uploadUrlData.key}`
        : undefined;
      createPost({
        content: postContent,
        media: mediaUrl,
      });
    }

    void uploadMedia().catch((e: Error) => {
      console.error(e);
      toast({
        title: "Well, that's embarrassing...",
        description:
          "Something went wrong while creating your post. Please try again.\n\nMessage: " +
          e.message,
        variant: "destructive",
      });
    });
  }, [
    createPost,
    formData,
    isGeneratingUrl,
    isUrlError,
    toast,
    uploadUrlData,
    urlError?.message,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        form.reset();
        setMediaPreview(undefined);
        setCharacterCount(0);
      }}
    >
      <DialogTrigger>
        <Button variant="nav" size="none" className="gap-2" asChild>
          <div>
            <AiOutlineEdit size={32} />
            <p className="hidden font-semibold lg:block">Create Post</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(setFormData)(e);
            }}
          >
            <FormField
              control={form.control}
              name="postContent"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-base">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Let your followers know whats going on."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Character count: {characterCount}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="postMedia"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between text-base">
                    <p>Media</p>
                    <Button
                      type="reset"
                      variant="destructive"
                      size="icon"
                      disabled={!mediaPreview}
                      onClick={() => {
                        setMediaPreview(undefined);
                        onChange(undefined);
                      }}
                    >
                      <BsTrash size={24} />
                    </Button>
                  </FormLabel>
                  <FormControl
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0];
                      if (!file) return;
                      setMediaPreview(file);
                    }}
                    className="relative rounded-md border border-muted"
                  >
                    <div>
                      <Input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        className="h-64 w-full cursor-pointer opacity-0"
                        {...fieldProps}
                        onChange={(event) => {
                          console.log(event.target.files);
                          if (!event.target.files) return;
                          onChange(event.target.files[0]);
                        }}
                      />
                      <div className="absolute left-0 top-0 -z-10 flex h-full w-full items-center justify-center rounded-md">
                        {!mediaPreview && (
                          <p className="text-center text-gray-500">
                            Click here to add an image
                          </p>
                        )}
                        {mediaPreview && (
                          <Image
                            src={URL.createObjectURL(mediaPreview)}
                            alt="post media"
                            fill={true}
                            className="relative max-w-full rounded-md object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Accepts .jpg, .jpeg, and .png files.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2 w-full text-center">
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function UserButton() {
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isUserLoaded)
    return (
      <div className="flex items-center gap-2 lg:px-4 lg:py-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
    );
  return (
    <>
      <SignedOut>
        <SignUpButton>
          <Button variant="nav" size="none">
            <VscAccount size={32} className="lg:mr-2" />
            <p className="hidden font-bold lg:block">Join the Club</p>
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button asChild className="gap-2" variant="nav" size="none">
          <Link href={`/user/${user?.id ?? ""}`}>
            <Image
              src={user?.imageUrl ?? ""}
              width={32}
              height={32}
              alt={`${user?.username ?? ""}'s profile picture`}
              className="rounded-full border-2 border-black"
            />
            <h3 className="hidden font-montserrat font-semibold lg:block">
              {toTitleCase(user?.username ?? "")}
            </h3>
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}
