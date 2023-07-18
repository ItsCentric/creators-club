import { AiOutlineSearch, AiOutlineHome } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 z-10 order-2 w-full border-t border-gray-300 bg-white p-4 lg:static lg:order-first lg:w-fit lg:border-r lg:px-10">
      <div className="mx-auto w-fit">
        <Image
          src="/cclogo.png"
          alt="creators club logo"
          width={64}
          height={64}
          className="mr-2 hidden align-middle lg:inline-block"
        />
        <p className="hidden bg-gradient-to-br from-primary-500 to-secondary-500 bg-clip-text font-cabin text-3xl font-extrabold text-transparent lg:inline-block lg:whitespace-pre-wrap lg:align-middle">
          {"Creators\nClub"}
        </p>
      </div>
      <div className="my-2 hidden h-px w-full bg-gray-300 lg:block"></div>
      <ul className="items-left flex justify-evenly gap-4 lg:my-2 lg:flex-col lg:gap-0">
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full hover:bg-accent-100/50 lg:px-4 lg:py-2"
          >
            <AiOutlineHome size={32} className="lg:mr-2 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Your Feed</p>
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full hover:bg-accent-100/50 lg:px-4 lg:py-2"
          >
            <AiOutlineSearch size={32} className="lg:mr-2 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Search</p>
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full hover:bg-accent-100/50 lg:px-4 lg:py-2"
          >
            <IoChatbubblesOutline
              size={32}
              className="lg:mr-2 lg:inline-block"
            />
            <p className="hidden font-semibold lg:inline-block">
              Conversations
            </p>
          </Link>
        </li>
        <li>
          <UserButton />
        </li>
      </ul>
    </nav>
  );
}

function UserButton() {
  const { user } = useUser();

  if (!user || !user.id || !user.username)
    return (
      <div className="flex items-center gap-2 lg:px-4 lg:py-2">
        <span className="block h-8 w-8 animate-pulse rounded-full bg-gray-300" />
        <span className="hidden h-4 w-24 animate-pulse rounded-full bg-gray-300 lg:block" />
      </div>
    );
  return (
    <>
      <SignedOut>
        <SignUpButton>
          <button className="flex w-full items-center rounded-full hover:bg-primary-100/80 lg:px-4 lg:py-2">
            <VscAccount size={32} className="lg:mr-2" />
            <p className="hidden font-bold lg:block">Join the Club</p>
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link
          className="flex items-center rounded-full hover:bg-accent-100/50 lg:px-4 lg:py-2"
          href={`/user/${user.id}`}
        >
          <Image
            src={user.imageUrl}
            width={32}
            height={32}
            alt={`${user.username}'s profile picture`}
            className="rounded-full border-2 border-black lg:mr-2"
          />
          <h3 className="hidden font-montserrat font-semibold lg:block">
            {toTitleCase(user?.username)}
          </h3>
        </Link>
      </SignedIn>
    </>
  );
}
