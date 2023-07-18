import { AiOutlineSearch, AiOutlineHome } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 z-10 order-2 w-full border-t border-gray-300 bg-white p-4 lg:static lg:order-first lg:w-fit lg:flex-grow lg:border-r">
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
      <ul className="items-left flex justify-evenly gap-2 lg:my-2 lg:flex-col">
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50"
          >
            <AiOutlineHome size={32} className="lg:mr-2 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Your Feed</p>
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50"
          >
            <AiOutlineSearch size={32} className="lg:mr-2 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Search</p>
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50"
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
        <li className="lg:hidden">
          <SignedIn>
            {user && (
              <Link href={`/user/${user.id}`}>
                <Image
                  src={user.imageUrl}
                  width={32}
                  height={32}
                  alt={"current user profile page button"}
                  className="rounded-full border-2 border-black"
                />
              </Link>
            )}
            {!user && (
              <span className="block h-8 w-8 animate-pulse rounded-full bg-gray-300" />
            )}
          </SignedIn>
          <SignedOut>
            <SignUpButton>
              <button className="flex items-center justify-center px-4 py-2">
                <VscAccount size={32} />
              </button>
            </SignUpButton>
          </SignedOut>
        </li>
      </ul>
    </nav>
  );
}
