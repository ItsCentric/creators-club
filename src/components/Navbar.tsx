import { AiOutlineSearch, AiOutlineHome } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";
import { Button } from "~/components/ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

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
        <p className="hidden bg-gradient-to-br from-primary to-secondary bg-clip-text font-cabin text-3xl font-extrabold text-transparent lg:inline-block lg:whitespace-pre-wrap lg:align-middle">
          {"Creators\nClub"}
        </p>
      </div>
      <Separator className="my-2" />
      <ul className="items-left flex justify-evenly gap-4 lg:flex-col lg:gap-1">
        <li>
          <Button asChild variant={"ghost"}>
            <Link href="/">
              <AiOutlineHome size={32} className="lg:mr-2 lg:inline-block" />
              <p className="hidden font-semibold lg:inline-block">Your Feed</p>
            </Link>
          </Button>
        </li>
        <li>
          <Button asChild variant={"ghost"}>
            <Link href="/">
              <AiOutlineSearch size={32} className="lg:mr-2 lg:inline-block" />
              <p className="hidden font-semibold lg:inline-block">Search</p>
            </Link>
          </Button>
        </li>
        <li>
          <Button asChild variant={"ghost"}>
            <Link href="/">
              <IoChatbubblesOutline
                size={32}
                className="lg:mr-2 lg:inline-block"
              />
              <p className="hidden font-semibold lg:inline-block">
                Conversations
              </p>
            </Link>
          </Button>
        </li>
        <li>
          <UserButton />
        </li>
      </ul>
    </nav>
  );
}

function UserButton() {
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isUserLoaded)
    return (
      <div className="flex items-center gap-2 lg:px-4 lg:py-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
      </div>
    );
  return (
    <>
      <SignedOut>
        <SignUpButton>
          <Button variant="ghost">
            <VscAccount size={32} className="lg:mr-2" />
            <p className="hidden font-bold lg:block">Join the Club</p>
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button asChild variant="ghost">
          <Link
            className="hover:bg-accent-100/50 flex items-center rounded-full lg:px-4 lg:py-2"
            href={`/user/${user?.id ?? ""}`}
          >
            <Image
              src={user?.imageUrl ?? ""}
              width={32}
              height={32}
              alt={`${user?.username ?? ""}'s profile picture`}
              className="rounded-full border-2 border-black lg:mr-2"
            />
            <h3 className="hidden font-montserrat font-semibold lg:block">
              {toTitleCase(user?.username ?? "")}
            </h3>
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}
