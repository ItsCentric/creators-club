import Image from "next/image";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

type BasicUser = {
  id: string;
  username: string;
  followerCount: number;
  avatarUrl: string;
  newPosts: number;
};

export default function ListOfUsers(props: {
  className: string;
  heading?: string;
  users: BasicUser[];
  subtext: string | number | JSX.Element;
  subtextData: "id" | "username" | "avatarUrl" | "followerCount" | "newPosts";
  reverseSubtext?: boolean;
}) {
  const usersHtml = props.users.map((user) => {
    const numberFormatter = new Intl.NumberFormat("en-US");
    const data = user[props.subtextData];
    const subtextData =
      typeof data === "number" ? numberFormatter.format(data) : data;

    return (
      <button
        className="flex w-full items-center justify-between rounded-full px-2 py-1 hover:bg-gray-200"
        key={user.id}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <Image
            src={user.avatarUrl}
            alt="user profile picture"
            width={32}
            height={32}
            className="mr-2 inline-block rounded-full align-middle"
          />
          <h3 className="inline-block align-middle font-montserrat font-semibold">
            {user.username}
          </h3>
        </div>
        <div>
          <p className="text-gray-400">
            {props.reverseSubtext ? subtextData : props.subtext}
            {props.reverseSubtext ? props.subtext : subtextData}
          </p>
        </div>
      </button>
    );
  });
  const [isClosed, setIsClosed] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-lg border border-gray-400 ${props.className}`}
      onClick={() => setIsClosed((previousState) => !previousState)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-montserrat text-xl font-semibold">
          {props.heading}
        </h3>
        {isClosed ? (
          <IoIosArrowDown size={16} color="gray" />
        ) : (
          <IoIosArrowUp size={16} color="gray" />
        )}
      </div>
      <ul
        className={`mt-2 flex flex-col gap-2 ${
          isClosed ? "invisible max-h-0" : ""
        }`}
      >
        {usersHtml}
      </ul>
    </div>
  );
}
