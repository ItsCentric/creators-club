import { CgFeed } from "react-icons/cg";
import { MdSearch } from "react-icons/md";
import { TbMessageCircle2 } from "react-icons/tb";
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
      <ul className="flex items-center justify-evenly gap-2 lg:my-2 lg:flex-col">
        <li>
          <Link
            href="/"
            className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50"
          >
            <CgFeed size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Your Feed</p>
          </Link>
        </li>
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50">
            <MdSearch size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Search</p>
          </button>
        </li>
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50">
            <TbMessageCircle2 size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">
              Conversations
            </p>
          </button>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88a9.947 9.947 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20z"
                  />
                </svg>
              </button>
            </SignUpButton>
          </SignedOut>
        </li>
      </ul>
    </nav>
  );
}
