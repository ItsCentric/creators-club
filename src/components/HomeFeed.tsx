import { MdOutlineSearchOff } from "react-icons/md";
import { type RouterOutputs, api } from "~/utils/api";
import ClientError from "./Error";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

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

function Post(props: {
  post: RouterOutputs["posts"]["getPosts"]["posts"][number];
}) {
  if (!props.post) return null;
  const post = props.post;
  const author = post.author;

  return (
    <div className="flex w-full flex-col pt-2" key={post.id}>
      <Link
        href={`/user/${post.authorId}`}
        className={"w-fit" + (post.media ? " pb-2" : " pb-1")}
      >
        <Image
          src={author.profileImageUrl}
          alt={`${author.username}'s profile picture`}
          height={32}
          width={32}
          className="ml-4 mr-1 inline-block rounded-full border-2 border-black align-middle"
        />
        <p className="inline-block align-middle font-cabin text-lg font-bold">
          {toTitleCase(author.username)}
        </p>
      </Link>
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
