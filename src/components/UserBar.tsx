import Image from "next/image";
import ListOfUsers from "./ListOfUsers";
import { SignUpButton, SignOutButton, useUser } from "@clerk/nextjs";
import { FaSignOutAlt } from "react-icons/fa";
import { IoPeopleOutline } from "react-icons/io5";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";
import RedirectToSettingsButton from "./RedirectToSettingsButton";
import { FiSettings } from "react-icons/fi";

export default function UserBar() {
  const userState = useUser();
  const users = [
    {
      id: "12jfigi3j25j2kasfd1234855rlka",
      username: "Niimir",
      followerCount: 1270,
      avatarUrl: "https://placehold.co/32/png",
      newPosts: 2,
    },
    {
      id: "j2i3tgnuhbgij3klqamf7g313thtgumq",
      username: "Printer Ink",
      followerCount: 123,
      avatarUrl: "https://placehold.co/32/png",
      newPosts: 7,
    },
    {
      id: "2hu3jgkbm2193qgbmanmfajojk231jthhgapm",
      username: "Kamsuke",
      followerCount: 19421,
      avatarUrl: "https://placehold.co/32/png",
      newPosts: 4,
    },
  ];

  return (
    <div className="hidden min-w-max flex-grow border-l border-gray-300 p-4 lg:flex lg:flex-col lg:gap-8">
      <UserButton userState={userState} />
      {userState.isSignedIn && (
        <ListOfUsers
          users={users}
          className="w-full min-w-max p-2"
          heading="You may like..."
          subtext={
            <IoPeopleOutline size={16} className="inline-block align-middle" />
          }
          subtextData="followerCount"
        />
      )}
      {userState.isSignedIn && (
        <ListOfUsers
          users={users}
          className="w-full p-2"
          heading="Recently Posted"
          subtext=" new posts"
          subtextData="newPosts"
          reverseSubtext={true}
        />
      )}

      <RedirectToSettingsButton className="mx-auto mt-auto w-fit self-end rounded-full px-4 py-2 hover:bg-gray-200">
        <FiSettings size={32} className="mr-2 inline-block" />
        <p className="inline-block font-montserrat font-semibold">Settings</p>
      </RedirectToSettingsButton>
    </div>
  );
}

function UserButton(props: { userState: ReturnType<typeof useUser> }) {
  const userState = props.userState;

  if (userState.isLoaded && !userState.isSignedIn) {
    return (
      <div className="mx-auto">
        <h3 className="mb-2 font-montserrat text-2xl font-semibold">
          New around here?
        </h3>
        <SignUpButton mode="modal">
          <button className="mx-auto block cursor-pointer rounded-full bg-red-500 px-4 py-2 font-montserrat font-semibold text-white hover:bg-red-600">
            Join the club
          </button>
        </SignUpButton>
      </div>
    );
  }

  const user = userState.user;

  return (
    <Link
      className="flex items-center rounded-full hover:bg-gray-200"
      href={`/user/${user?.id ?? ""}`}
    >
      {user?.imageUrl ? (
        <Image
          src={user?.imageUrl ?? ""}
          width={64}
          height={64}
          alt={`${user.username ?? "user"}'s profile picture`}
          className="mr-2 rounded-full border-2 border-black bg-gray-200"
        />
      ) : (
        <div className="mr-2 h-16 w-16 rounded-full border-2 border-black bg-gray-200"></div>
      )}
      <h3 className="font-montserrat text-2xl font-semibold">
        {user?.username
          ? toTitleCase(user?.username ?? "user")
          : skeletonText()}
      </h3>
      <button
        className="ml-auto rounded-full p-2 text-red-500 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <SignOutButton>
          <FaSignOutAlt size={24} />
        </SignOutButton>
      </button>
    </Link>
  );
}

function skeletonText() {
  return (
    <div className="flex animate-pulse items-center">
      <div className="h-8 w-32 rounded-full bg-gray-200"></div>
    </div>
  );
}
