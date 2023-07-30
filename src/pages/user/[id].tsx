import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import { BiPencil, BiSad } from "react-icons/bi";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import RedirectToSettingsButton from "~/components/RedirectToSettingsButton";
import NotFound from "../404";
import ClientError from "~/components/Error";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { type SimplifiedUser } from "~/server/api/routers/users";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();

  const queriedUserId = router.query.id as string;
  const { data: user, error: getUserError } = api.users.getUser.useQuery(
    queriedUserId,
    { enabled: !!queriedUserId }
  );
  const { data: followers, error: getFollowersError } =
    api.users.getFollowers.useQuery(queriedUserId, {
      enabled: !!queriedUserId,
    });
  const { data: following, error: getFollowingError } =
    api.users.getFollowing.useQuery(queriedUserId, {
      enabled: !!queriedUserId,
    });
  const { user: signedInUser } = useUser();

  if (!router.query.id) return NotFound();
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
    <>
      <div className="grid grid-cols-2 place-items-center gap-1 border-b border-b-muted px-4 py-8">
        <div className="place-self-start lg:place-self-auto">
          <Image
            src={user.profilePictureUrl}
            width={96}
            height={96}
            alt={`${user.username}'s profile picture`}
            className="inline-block rounded-full border-2 border-foreground bg-gray-200 align-middle lg:mr-4"
          />
        </div>
        <div className="flex max-w-full justify-evenly gap-4">
          <UserListModal
            disabled={!hasFollowers}
            users={followers}
            title="Followers"
          >
            <div className="flex min-w-0 flex-col items-center text-lg">
              <h3 className="font-semibold">Followers</h3>
              <p>{followers.length}</p>
            </div>
          </UserListModal>
          <UserListModal
            disabled={!hasFollowing}
            users={following}
            title="Following"
          >
            <div className="flex min-w-0 flex-col items-center text-lg">
              <h3 className="font-semibold">Following</h3>
              <p>{following.length}</p>
            </div>
          </UserListModal>
        </div>
        <div className="place-self-start lg:place-self-auto">
          <h1 className="text-3xl font-semibold">
            {toTitleCase(user.username)}
          </h1>
          <p className="text-md text-gray-400">{name}</p>
        </div>
        <div>
          {signedInUser?.id === user.id && (
            <RedirectToSettingsButton size="lg">
              <BiPencil size={24} className="mr-1" />
              <p className="font-semibold">Edit Profile</p>
            </RedirectToSettingsButton>
          )}
          {signedInUser?.id !== user.id && (
            <FollowButton userId={user.id ?? ""} size="lg" />
          )}
        </div>
      </div>
      <div className="flex flex-grow flex-col items-center justify-center">
        <BiSad size={64} />
        <p className="text-2xl font-bold">No posts</p>
      </div>
    </>
  );
}

function UserListModal({
  users,
  title,
  children,
  disabled,
}: {
  users: SimplifiedUser[];
  title: string;
  children: React.ReactNode;
  disabled: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [previousPath, setPreviousPath] = useState(router.asPath);
  const hasUsers = users.length >= 1;

  useEffect(() => {
    if (open && previousPath !== router.asPath) setOpen(false);
    setPreviousPath(router.asPath);
  }, [open, previousPath, router.asPath]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={disabled} className="disabled:opacity-70">
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>
          {hasUsers &&
            users.map((user) => {
              return (
                <div key={user.id} className="flex justify-between">
                  <Link href={`/user/${user.id}`}>
                    <Image
                      src={user.profilePictureUrl}
                      alt={`${user.username}'s profile picture`}
                      width={48}
                      height={48}
                      className="mr-2 inline-block rounded-full border-2 border-black align-middle"
                    />
                    <div className="inline-block align-middle">
                      <p className="text-lg font-bold">
                        {toTitleCase(user.username)}
                      </p>
                      <p className="text-md -mt-1 text-gray-400">
                        {`${user.firstName ?? ""} ${user.lastName ?? ""}`}
                      </p>
                    </div>
                  </Link>
                  {!user.isSelf && <FollowButton userId={user.id} size="sm" />}
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FollowButton(props: {
  userId: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}) {
  const userId = props.userId;
  const trpcRouterContext = api.useContext();
  const { mutate: followUser } = api.users.followUser.useMutation({
    onSuccess: async () => {
      await trpcRouterContext.users.invalidate();
    },
  });
  const { mutate: unfollowUser } = api.users.unfollowUser.useMutation({
    onSuccess: async () => {
      await trpcRouterContext.users.invalidate();
    },
  });
  const { data: isFollowing, error } = api.users.isFollowing.useQuery(userId);

  if (error) {
    <ClientError httpCode={error.data?.httpStatus} message={error.message}>
      Could not determine if following.
    </ClientError>;
  }

  if (isFollowing) {
    return (
      <Button
        size={props.size}
        variant="destructive"
        onClick={() => unfollowUser(userId)}
        className="font-semibold"
      >
        Unfollow
      </Button>
    );
  }
  return (
    <Button
      size={props.size}
      variant={props.variant}
      onClick={() => followUser(userId)}
      className="font-semibold"
    >
      Follow
    </Button>
  );
}

function UserSkeletonPage() {
  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <div className="flex items-center justify-around border-b border-b-muted px-4 py-8">
        <div className="animate-pulse">
          <Skeleton className="mb-2 h-24 w-24 rounded-full lg:mr-2" />
          <div className="inline-block align-middle">
            <div className="flex items-center">
              <Skeleton className="mb-2 h-6 w-32 rounded-full"></Skeleton>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-16 rounded-full"></Skeleton>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center text-xl">
            <div className="flex items-center">
              <Skeleton className="mb-2 h-6 w-24 rounded-full"></Skeleton>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-8 w-16 rounded-full"></Skeleton>
            </div>
          </div>
          <div className="flex flex-col items-center text-xl">
            <div className="flex items-center">
              <Skeleton className="mb-2 h-6 w-24 rounded-full"></Skeleton>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-8 w-16 rounded-full"></Skeleton>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-grow flex-col items-center px-8 py-4">
        <div className="mb-8 w-full max-w-lg">
          <div className="mb-2">
            <Skeleton className="mr-2 inline-block h-16 w-16 rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-6 w-32 rounded-full align-middle"></Skeleton>
          </div>
          <Skeleton className="aspect-video w-full"></Skeleton>
          <div className="py-2">
            <Skeleton className="inline-block h-4 w-full rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-4 w-full rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-4 w-4/5 rounded-full align-middle"></Skeleton>
          </div>
        </div>
        <div className="w-full max-w-lg">
          <div className="mb-2">
            <Skeleton className="mr-2 inline-block h-16 w-16 rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-6 w-32 rounded-full align-middle"></Skeleton>
          </div>
          <div className="py-2">
            <Skeleton className="inline-block h-4 w-full rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-4 w-full rounded-full align-middle"></Skeleton>
            <Skeleton className="inline-block h-4 w-4/5 rounded-full align-middle"></Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}
