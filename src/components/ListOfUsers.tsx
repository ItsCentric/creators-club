import Image from "next/image";

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
  subtext: string;
  subtextData: "id" | "username" | "avatarUrl" | "followerCount" | "newPosts";
  reverseSubtext?: boolean;
}) {
  const usersHtml = props.users.map((user) => {
    const subtextData = user[props.subtextData];

    return (
      <button
        className="flex w-full items-center justify-between"
        key={user.id}
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
            {props.reverseSubtext ? subtextData : props.subtext + ":"}{" "}
            {props.reverseSubtext ? props.subtext : subtextData}
          </p>
        </div>
      </button>
    );
  });

  return (
    <div className={`rounded-lg border border-gray-400 ${props.className}`}>
      <h3 className="mb-2 font-montserrat text-xl font-semibold">
        {props.heading}
      </h3>
      <ul className="flex flex-col gap-2">{usersHtml}</ul>
    </div>
  );
}
