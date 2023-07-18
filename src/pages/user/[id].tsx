import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import { BiPencil, BiSad } from "react-icons/bi";
import Navbar from "~/components/Navbar";
import { createRef, useEffect } from "react";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useUser } from "@clerk/nextjs";
import RedirectToSettingsButton from "~/components/RedirectToSettingsButton";
import NotFound from "../404";
import ClientError from "~/components/Error";

export default function ProfilePage() {
  const router = useRouter();
  const trpcRouterContext = api.useContext();
  const queriedUserId = router.query.id as string;
  const { data: user, error: getUserError } =
    api.users.getUser.useQuery(queriedUserId);
  const { data: followers, error: getFollowersError } =
    api.users.getFollowers.useQuery(queriedUserId);
  const { data: following, error: getFollowingError } =
    api.users.getFollowing.useQuery(queriedUserId);
  const followUser = api.users.followUser.useMutation;
  const unfollowUser = api.users.unfollowUser.useMutation;
  const followersModal = createRef<HTMLDialogElement>();
  const followingModal = createRef<HTMLDialogElement>();
  const { user: signedInUser } = useUser();

  useEffect(() => {
    const currentFollowersModal = followersModal.current;
    const currentFollowingModal = followingModal.current;

    return () => {
      currentFollowersModal?.close();
      currentFollowingModal?.close();
    };
  });
  if (!router.query.id) NotFound();
  if (!user || !followers || !following) return <UserSkeletonPage />;
  if (getUserError || getFollowingError || getFollowersError) {
    const error = getUserError || getFollowingError || getFollowersError;

    return (
      <ClientError
        httpCode={error?.data?.httpStatus}
        statusCode={error?.data?.code}
        message={error?.message}
      >
        Sorry, something went wrong. Please try again.
      </ClientError>
    );
  }

  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
  const hasFollowers = followers.length >= 1;
  const hasFollowing = following.length >= 1;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <dialog ref={followersModal} className="w-4/5 max-w-lg rounded-lg">
        <IoMdClose
          className="absolute right-2 top-2 cursor-pointer"
          size={16}
          onClick={() => followersModal.current?.close()}
        />
        <h1 className="mb-2 text-2xl font-bold">Followers</h1>
        <div>
          {hasFollowers &&
            followers.map((follower) => {
              return (
                <div key={follower.id} className="flex justify-between">
                  <Link href={`/user/${follower.id}`}>
                    <Image
                      src={follower.profilePictureUrl}
                      alt={`${follower.username}'s profile picture`}
                      width={48}
                      height={48}
                      className="mr-2 inline-block rounded-full border-2 border-black align-middle"
                    />
                    <div className="inline-block align-middle">
                      <p className="text-lg font-bold">
                        {toTitleCase(follower.username)}
                      </p>
                      <p className="text-md -mt-1 text-gray-400">
                        {`${follower.firstName ?? ""} ${
                          follower.lastName ?? ""
                        }`}
                      </p>
                    </div>
                  </Link>
                  {!follower.isSelf && (
                    <FollowButton
                      userId={follower.id}
                      followUserMutation={followUser}
                      unfollowUserMutation={unfollowUser}
                      trpcRouterContext={trpcRouterContext}
                    />
                  )}
                </div>
              );
            })}
          {!hasFollowers && <div>something went wrong</div>}
        </div>
      </dialog>
      <dialog ref={followingModal} className="w-4/5 max-w-lg rounded-lg">
        <IoMdClose
          className="absolute right-2 top-2 cursor-pointer"
          size={16}
          onClick={() => followingModal.current?.close()}
        />
        <h1 className="mb-2 text-2xl font-bold">Following</h1>
        <div>
          {following.length > 0 &&
            following.map((follower) => {
              return (
                <div key={follower.id} className="flex justify-between">
                  <Link href={`/user/${follower.id}`}>
                    <Image
                      src={follower.profilePictureUrl}
                      alt={`${follower.username}'s profile picture`}
                      width={48}
                      height={48}
                      className="mr-2 inline-block rounded-full border-2 border-black align-middle"
                    />
                    <div className="inline-block align-middle">
                      <p className="text-lg font-bold">
                        {toTitleCase(follower.username)}
                      </p>
                      <p className="text-md -mt-1 text-gray-400">
                        {`${follower.firstName ?? ""} ${
                          follower.lastName ?? ""
                        }`}
                      </p>
                    </div>
                  </Link>
                  {!follower.isSelf && (
                    <FollowButton
                      userId={follower.id}
                      followUserMutation={followUser}
                      unfollowUserMutation={unfollowUser}
                      trpcRouterContext={trpcRouterContext}
                    />
                  )}
                </div>
              );
            })}
        </div>
      </dialog>
      <Navbar />
      <div className="flex h-full flex-grow-[8] flex-col">
        <div className="grid grid-cols-2 place-items-center gap-1 border-b border-b-gray-200 px-4 py-8">
          <div className="place-self-start lg:place-self-auto">
            <Image
              src={user.profilePictureUrl}
              width={96}
              height={96}
              alt={`${user.username}'s profile picture`}
              className="inline-block rounded-full border-2 border-black bg-gray-200 align-middle lg:mr-4"
            />
          </div>
          <div className="flex max-w-full justify-evenly gap-4">
            <div
              className={
                "flex min-w-0 flex-col items-center text-lg" +
                (hasFollowers ? " cursor-pointer" : " contrast-50")
              }
              onClick={() => {
                if (!hasFollowers) return;
                followersModal.current?.showModal();
              }}
            >
              <h3 className="font-semibold">Followers</h3>
              <p>{followers.length}</p>
            </div>
            <div
              className={
                "flex min-w-0 flex-col items-center text-lg" +
                (hasFollowing ? " cursor-pointer" : " contrast-50")
              }
              onClick={() => {
                if (!hasFollowing) return;
                followingModal.current?.showModal();
              }}
            >
              <h3 className="font-semibold">Following</h3>
              <p>{following.length}</p>
            </div>
          </div>
          <div className="place-self-start lg:place-self-auto">
            <h1 className="text-3xl font-semibold">
              {toTitleCase(user.username)}
            </h1>
            <p className="text-md text-gray-400">{name}</p>
          </div>
          <div>
            {signedInUser?.id === user.id && (
              <RedirectToSettingsButton className="rounded-full bg-accent-400 px-4 py-2 hover:bg-accent-500">
                <BiPencil
                  size={32}
                  className="mr-1 inline-block align-middle"
                />
                <p className="inline-block align-middle text-lg font-semibold">
                  Edit Profile
                </p>
              </RedirectToSettingsButton>
            )}
            {signedInUser?.id !== user.id && (
              <FollowButton
                userId={user.id ?? ""}
                followUserMutation={followUser}
                unfollowUserMutation={unfollowUser}
                trpcRouterContext={trpcRouterContext}
              />
            )}
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center">
          <BiSad size={64} />
          <p className="text-2xl font-bold">No posts</p>
        </div>
      </div>
    </div>
  );
}

function FollowButton(props: {
  userId: string;
  followUserMutation: typeof api.users.followUser.useMutation;
  unfollowUserMutation: typeof api.users.unfollowUser.useMutation;
  trpcRouterContext: ReturnType<typeof api.useContext>;
}) {
  const userId = props.userId;
  const followUser = props.followUserMutation({
    onSuccess: async () => {
      await props.trpcRouterContext.users.invalidate();
    },
  }).mutate;
  const unfollowUser = props.unfollowUserMutation({
    onSuccess: async () => {
      await props.trpcRouterContext.users.invalidate();
    },
  }).mutate;
  const { data: isFollowing, error } = api.users.isFollowing.useQuery(userId);

  if (error) {
    <ClientError httpCode={error.data?.httpStatus} message={error.message}>
      Could not determine if following.
    </ClientError>;
  }

  if (isFollowing) {
    return (
      <button
        className="rounded-full bg-secondary-400 px-8 py-2 font-semibold text-white hover:bg-secondary-500"
        onClick={() => unfollowUser(userId)}
      >
        Unfollow
      </button>
    );
  }
  return (
    <>
      <button
        onClick={() => followUser(userId)}
        className="rounded-full bg-accent-400 px-8 py-2 font-semibold text-black hover:bg-accent-500"
      >
        Follow
      </button>
    </>
  );
}

function UserSkeletonPage() {
  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <div className="flex items-center justify-around border-b border-b-gray-200 px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-2 inline-block h-16 w-16 rounded-full border-2 border-black bg-gray-200 align-middle lg:mr-2"></div>
          <div className="inline-block align-middle">
            <div className="flex items-center">
              <div className="mb-2 h-6 w-32 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-16 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
        <div className="flex animate-pulse gap-4">
          <div className="flex flex-col items-center text-xl">
            <div className="flex items-center">
              <div className="mb-2 h-6 w-24 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-16 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-col items-center text-xl">
            <div className="flex items-center">
              <div className="mb-2 h-6 w-24 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-16 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-grow flex-col items-center px-8 py-4">
        <div className="mb-8 w-full max-w-lg animate-pulse">
          <div className="mb-2">
            <div className="mr-2 inline-block h-16 w-16 rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-6 w-32 rounded-full bg-gray-200 align-middle"></div>
          </div>
          <div className="aspect-video w-full bg-gray-200"></div>
          <div className="py-2">
            <div className="inline-block h-4 w-full rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-4 w-full rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-4 w-4/5 rounded-full bg-gray-200 align-middle"></div>
          </div>
        </div>
        <div className="w-full max-w-lg animate-pulse">
          <div className="mb-2">
            <div className="mr-2 inline-block h-16 w-16 rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-6 w-32 rounded-full bg-gray-200 align-middle"></div>
          </div>
          <div className="py-2">
            <div className="inline-block h-4 w-full rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-4 w-full rounded-full bg-gray-200 align-middle"></div>
            <div className="inline-block h-4 w-4/5 rounded-full bg-gray-200 align-middle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
