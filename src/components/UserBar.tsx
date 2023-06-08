import Image from "next/image";
import ListOfUsers from "./ListOfUsers";
import { FiSettings } from "react-icons/fi";

export default function UserBar() {
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
    <div className="hidden flex-grow border-l border-gray-300 p-4 lg:flex lg:flex-col lg:gap-8">
      <div className="text-2xl">
        <Image
          src="https://placehold.co/64/png"
          alt="user profile picture"
          width={64}
          height={64}
          className="mr-2 inline-block rounded-full"
        />
        <p className="inline-block font-montserrat text-2xl font-semibold">
          Centric
        </p>
      </div>
      <ListOfUsers
        users={users}
        className="w-full p-2"
        heading="You may like..."
        subtext="Followers"
        subtextData="followerCount"
      />
      <ListOfUsers
        users={users}
        className="w-full p-2"
        heading="Recently Posted"
        subtext="new posts"
        subtextData="newPosts"
        reverseSubtext={true}
      />
      <button className="mx-auto mt-auto w-fit self-end rounded-full px-4 py-2 hover:bg-gray-200">
        <FiSettings size={32} className="mr-2 inline-block" />
        <p className="inline-block font-montserrat font-semibold">Settings</p>
      </button>
    </div>
  );
}
