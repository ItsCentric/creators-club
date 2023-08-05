import { MdOutlineSearchOff } from "react-icons/md";
import { type RouterOutputs, api } from "~/utils/api";
import ClientError from "./Error";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { type ReactNode, useEffect, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import PostWizard from "./PostWizard";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import { useToast } from "./ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import moment from "moment";
import { Separator } from "./ui/separator";

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const windowScrollTop =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (windowScrollTop / height) * 100;

    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
}

type PostWithBasicUser = RouterOutputs["posts"]["getPosts"]["posts"][number];

export default function HomeFeed() {
  const scrollPosition = useScrollPosition();
  const postsQuery = api.posts.getPosts.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (
      scrollPosition > 90 &&
      postsQuery.hasNextPage &&
      !postsQuery.isFetching
    ) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery, scrollPosition]);

  if (postsQuery.isLoading) return <SkeletonFeed />;

  if (postsQuery.isError) {
    const error = postsQuery.error;

    return (
      <ClientError
        httpCode={error.data?.httpStatus}
        statusCode={error.data?.code}
        message={error.message}
      >
        Something went wrong when getting your posts, sorry about that!
      </ClientError>
    );
  }

  const posts = postsQuery.data.pages.flatMap((page) => page.posts);
  if (posts.length === 0 && !postsQuery.isLoading && !postsQuery.isError) {
    return (
      <div className="flex h-full flex-grow-[8] flex-col items-center justify-center p-4 text-center">
        <MdOutlineSearchOff
          size={48}
          className="border-secondary-600 text-secondary-600 mb-2 rounded-full border-2 bg-white p-1"
        />
        <h1 className="font-cabin text-2xl font-bold">Uh oh!</h1>
        <p className="font-montserrat font-medium">
          {"Couldn't find any posts :("}
        </p>
      </div>
    );
  }

  const formattedPosts = posts.map((post) => {
    return <Post post={post} key={post.id} />;
  });

  return (
    <div className="mb-2 flex min-h-full max-w-2xl flex-grow flex-col gap-2 divide-y border-x border-muted lg:gap-4 lg:self-center">
      <>{formattedPosts}</>
      <div className="flex items-center justify-center pt-2">
        <Button
          onClick={() => void postsQuery.fetchNextPage()}
          disabled={!postsQuery.hasNextPage || postsQuery.isFetching}
        >
          More posts
        </Button>
      </div>
    </div>
  );
}

function Post(props: { post: PostWithBasicUser }) {
  const { user } = useUser();
  if (!props.post) return null;
  const post = props.post;
  const author = post.author;
  const latestEdit = post.previousEdits[0];

  return (
    <div className="flex w-full flex-col pt-2" key={post.id}>
      <div
        className={`flex items-center justify-between px-4 ${
          post.media ? "pb-2" : "pb-1"
        }`}
      >
        <div>
          <Link
            href={`/user/${post.authorId}`}
            className="inline-flex items-center gap-1 align-middle"
          >
            <Image
              src={author.profileImageUrl}
              alt={`${author.username}'s profile picture`}
              height={32}
              width={32}
              className="rounded-full border-2 border-black"
            />
            <p className="font-cabin text-lg font-bold">
              {toTitleCase(author.username)}
            </p>
          </Link>
          {latestEdit && (
            <>
              <span className="mx-1 align-middle text-gray-600 dark:text-gray-400">
                ·
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Dialog>
                      <DialogTrigger>
                        <p className="align-middle text-sm text-gray-600 dark:text-gray-400">
                          edited
                        </p>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Revisions</DialogTitle>
                          <DialogDescription>
                            All previous versions of this post.
                          </DialogDescription>
                        </DialogHeader>
                        <div>
                          {post.previousEdits.map((previousEdit, index) => {
                            return (
                              <>
                                <div
                                  className="flex flex-col gap-2"
                                  key={previousEdit.id}
                                >
                                  <p>{previousEdit.content}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {moment(previousEdit.createdAt).format(
                                      "MMMM Do YYYY, h:mma"
                                    )}
                                  </p>
                                </div>
                                {index !== post.previousEdits.length - 1 && (
                                  <Separator className="my-2" />
                                )}
                              </>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edited {moment(latestEdit.createdAt).fromNow()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        {user?.id === post.authorId && (
          <div>
            <PostOptionsDropdown post={post} />
          </div>
        )}
      </div>
      <div>
        {post.media && (
          <div className="bg-muted">
            <Image
              src={post.media}
              alt={post.content}
              height={400}
              width={400}
              className="mx-auto aspect-square object-cover"
            />
          </div>
        )}
        <p
          className={
            "line-clamp-4 max-h-96 px-4 font-montserrat" +
            (post.media ? " mt-2 text-sm" : "")
          }
        >
          {post.content}
        </p>
      </div>
    </div>
  );
}

function PostOptionsDropdown(props: { post: PostWithBasicUser }) {
  const [openEditPost, setOpenEditPost] = useState(false);
  const [openDeletePost, setOpenDeletePost] = useState(false);
  const { post } = props;

  return (
    <PostWizard
      mode="edit"
      postData={post}
      dropdown
      open={openEditPost}
      onOpenChange={setOpenEditPost}
    >
      <DeletePostAlert
        post={post}
        open={openDeletePost}
        onOpenChange={setOpenDeletePost}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <AiOutlineMore size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setOpenEditPost(true)}>
              Edit Post
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setOpenDeletePost(true)}
              className="text-red-800 dark:text-red-400"
            >
              Delete Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DeletePostAlert>
    </PostWizard>
  );
}

function DeletePostAlert(props: {
  post: PostWithBasicUser;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpcContext = api.useContext();
  const { toast } = useToast();
  const [deletePostCountdown, setDeletePostCountdown] = useState(5);
  const { mutate: deletePost } = api.posts.deletePost.useMutation({
    onSuccess: async () => {
      props.onOpenChange(false);
      await trpcContext.posts.getPosts.invalidate();
      toast({
        title: "Post deleted",
        description:
          "Your post has been deleted. No one will lay eyes on it ever again.",
        variant: "success",
      });
    },
    onError: (error) => {
      props.onOpenChange(false);
      toast({
        title: "Well that's embarrassing...",
        description: `Something went wrong while deleting your post.\nCode: ${
          error.data?.code ?? "INTERNAL_SERVER_ERROR"
        }\nMessage: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  const { post, children, open, onOpenChange } = props;

  useEffect(() => {
    if (open && deletePostCountdown > 0) {
      const interval = setInterval(() => {
        setDeletePostCountdown((countdown) => countdown - 1);
      }, 1000);
      return () => clearInterval(interval);
    }

    return () => {
      setDeletePostCountdown(5);
    };
  }, [deletePostCountdown, open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              You will <strong>not</strong> be able to undo this.
            </p>
            {deletePostCountdown > 0 && (
              <p>
                You will be able to continue in {deletePostCountdown} seconds.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deletePostCountdown > 0}
            onClick={() =>
              post.media
                ? deletePost({
                    postData: { postId: post.id, authorId: post.authorId },
                    media: post.media,
                  })
                : deletePost({
                    postData: { postId: post.id, authorId: post.authorId },
                  })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SkeletonFeed() {
  return (
    <div className="mb-2 flex min-h-full w-full max-w-2xl flex-grow flex-col gap-2 divide-y border-x border-gray-300 lg:gap-4 lg:self-center">
      <div className="flex w-full flex-col pt-2">
        <div className="w-fit pb-1">
          <Skeleton className="ml-4 mr-1 inline-block h-8 w-8 rounded-full border-2 border-black align-middle" />
          <Skeleton className="inline-block h-5 w-24 rounded-full align-middle" />
        </div>
        <div>
          <div className="bg-gray-100/50">
            <Skeleton className="mx-auto block aspect-square h-96 w-96 object-cover" />
          </div>
          <div className="px-4">
            <Skeleton className="mt-1 block h-3 max-h-96 rounded-full" />{" "}
            <Skeleton className="mt-1 block h-3 max-h-96 w-4/5 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col pt-2">
        <div className="w-fit pb-1">
          <Skeleton className="ml-4 mr-1 inline-block h-8 w-8 rounded-full border-2 border-black align-middle" />

          <Skeleton className="inline-block h-5 w-24 rounded-full align-middle" />
        </div>
        <div>
          <div className="bg-gray-100/50">
            <Skeleton className="mx-auto block aspect-square h-96 w-96 object-cover" />
          </div>
          <div className="px-4">
            <Skeleton className="mt-1 block h-3 max-h-96 rounded-full" />{" "}
            <Skeleton className="mt-1 block h-3 max-h-96 w-4/5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
