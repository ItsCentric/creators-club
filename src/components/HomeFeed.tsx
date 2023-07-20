import { MdOutlineSearchOff } from "react-icons/md";
import { api } from "~/utils/api";
import ClientError from "./Error";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import Link from "next/link";

export default function HomeFeed() {
  const {
    data: posts,
    error: getPostsError,
    isLoading: isPostsLoading,
  } = api.posts.getPosts.useQuery({ limit: 10, offset: 0 });

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
          className="mb-2 rounded-full border-2 border-secondary-600 bg-white p-1 text-secondary-600"
        />
        <h1 className="font-cabin text-2xl font-bold">Uh oh!</h1>
        <p className="font-montserrat font-medium">
          {"Couldn't find any posts :("}
        </p>
      </div>
    );
  }

  const formattedPosts = posts?.map((post) => {
    const author = post.author;

    return (
      <div
        className="flex w-4/5 flex-col rounded-lg border-2 p-2"
        key={post.id}
      >
        <Link
          href={`/user/${post.authorId}`}
          className="border-b-2 border-b-gray-300 pb-1"
        >
          <Image
            src={author.profileImageUrl}
            alt={`${author.username}'s profile picture`}
            height={48}
            width={48}
            className="mr-1 inline-block rounded-full border-2 border-black align-middle"
          />
          <p className="inline-block align-middle font-cabin text-xl font-bold">
            {toTitleCase(author.username)}
          </p>
        </Link>
        <div>
          {post.media && (
            <Image
              src={post.media}
              alt={post.content}
              height={400}
              width={400}
              className="mx-auto aspect-square object-cover"
            />
          )}
          <p
            className={"pt-2 font-montserrat" + (post.media ? " text-sm" : "")}
          >
            {post.content}
          </p>
        </div>
      </div>
    );
  });

  return (
    <div className="flex h-full max-w-2xl flex-grow flex-col items-center px-4 py-6">
      {formattedPosts}
    </div>
  );
}
