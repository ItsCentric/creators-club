import { AiOutlineSearch, AiOutlineHome, AiOutlineEdit } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { BsMoon, BsSun } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";
import { Button } from "~/components/ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import PostWizard from "./PostWizard";

export default function Navbar() {
  return (
    <>
      <nav className="sticky bottom-0 z-50 order-2 flex w-full flex-col gap-2 border-t border-muted bg-background p-4 lg:top-0 lg:order-first lg:h-screen lg:w-fit lg:border-r lg:px-10">
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
        <Separator className="hidden lg:block" />
        <ul className="items-left flex grow justify-evenly gap-4 lg:my-2 lg:flex-col lg:justify-normal lg:gap-0">
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <AiOutlineHome size={32} />
                <p className="hidden font-semibold lg:inline-block">
                  Your Feed
                </p>
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <AiOutlineSearch size={32} />
                <p className="hidden font-semibold lg:inline-block">Search</p>
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="nav" size="none" className="gap-2" asChild>
              <Link href="/">
                <IoChatbubblesOutline size={32} />
                <p className="hidden font-semibold lg:inline-block">
                  Conversations
                </p>
              </Link>
            </Button>
          </li>
          <SignedIn>
            <li>
              <PostWizard mode="create">
                <Button variant="nav" size="none" className="gap-2" asChild>
                  <div>
                    <AiOutlineEdit size={32} />
                    <p className="hidden font-semibold lg:block">Create Post</p>
                  </div>
                </Button>
              </PostWizard>
            </li>
          </SignedIn>
          <li className="order-6 lg:order-5">
            <UserButton />
          </li>
          <li className="order-5 mt-auto lg:order-6">
            <ThemeButton />
          </li>
        </ul>
      </nav>
    </>
  );
}

function ThemeButton() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (
    <Button
      variant="nav"
      size="none"
      className="gap-2"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    >
      <BsSun
        size={30}
        className={resolvedTheme === "light" ? "block" : "hidden"}
      />
      <BsMoon
        size={30}
        className={resolvedTheme === "dark" ? "block" : "hidden"}
      />
      <p className="hidden lg:block">{toTitleCase(resolvedTheme ?? "")} Mode</p>
    </Button>
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
          <Button variant="nav" size="none">
            <VscAccount size={32} className="lg:mr-2" />
            <p className="hidden font-bold lg:block">Join the Club</p>
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button asChild className="gap-2" variant="nav" size="none">
          <Link href={`/user/${user?.id ?? ""}`}>
            <Image
              src={user?.imageUrl ?? ""}
              width={32}
              height={32}
              alt={`${user?.username ?? ""}'s profile picture`}
              className="rounded-full border-2 border-black"
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
