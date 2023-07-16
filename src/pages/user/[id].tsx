import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";
import { BiSad } from "react-icons/bi";
import Navbar from "~/components/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  if (!router.query.id) return <div>something went wrong!</div>;
  const user = api.users.getUser.useQuery(router.query.id as string);
  if (user.isInitialLoading) return <UserSkeletonPage />;
  if (!user.data || user.error) return <div>something went wrong!</div>;
  const userData = user.data;
  const name = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`;

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <Navbar />
      <div className="flex h-full flex-grow-[8] flex-col">
        <div className="flex items-center justify-around border-b border-b-gray-200 px-4 py-8">
          <div>
            <Image
              src={userData.profilePictureUrl}
              width={96}
              height={96}
              alt={`${userData.username}'s profile picture`}
              className="inline-block rounded-full border-2 border-black bg-gray-200 align-middle lg:mr-4"
            />
            <div className="inline-block align-middle">
              <h1 className="text-3xl font-semibold">
                {toTitleCase(userData.username)}
              </h1>
              <p className="text-md text-gray-400">{name}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center text-xl">
              <h3 className="font-semibold">Followers</h3>
              <p>{userData.followerCount}</p>
            </div>
            <div className="flex flex-col items-center text-xl">
              <h3 className="font-semibold">Following</h3>
              <p>{userData.followingCount}</p>
            </div>
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

function UserSkeletonPage() {
  return (
    <div className="flex h-full max-h-screen flex-col overflow-hidden">
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
