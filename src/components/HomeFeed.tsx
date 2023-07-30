import { MdOutlineSearchOff } from "react-icons/md";
import { type RouterOutputs, api } from "~/utils/api";
import ClientError from "./Error";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export default function HomeFeed() {
  const {
    data: posts,
    error: getPostsError,
    isLoading: isPostsLoading,
  } = api.posts.getPosts.useQuery({ limit: 10, offset: 0 });

  if (isPostsLoading) return <SkeletonFeed />;

  if (getPostsError) {
    return (
      <ClientError
        httpCode={getPostsError.data?.httpStatus}
        statusCode={getPostsError.data?.code}
        message={getPostsError.message}
      >
        Something went wrong when getting your posts, sorry about that!
      </ClientError>
    );
  }

  if (posts?.length === 0 && !isPostsLoading && !getPostsError) {
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

  const formattedPosts = posts?.map((post) => {
    return <Post post={post} key={post.id} />;
  });

  return (
    <div className="mb-2 flex min-h-full max-w-2xl flex-grow flex-col gap-2 divide-y border-x border-gray-300 lg:gap-4 lg:self-center">
      {formattedPosts}
    </div>
  );
}

function Post(props: { post: RouterOutputs["posts"]["getPosts"][number] }) {
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
          <div className="bg-gray-100">
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
