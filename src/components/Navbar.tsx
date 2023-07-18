import { CgFeed } from "react-icons/cg";
import { MdSearch } from "react-icons/md";
import { TbMessageCircle2 } from "react-icons/tb";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 z-10 order-2 w-full border-t border-gray-300 bg-white p-4 lg:static lg:order-first lg:w-fit lg:flex-grow lg:border-r">
      <div className="mx-auto w-fit">
        <Image
          src="/cclogo.png"
          alt="creators club logo"
          width={64}
          height={64}
          className="mr-2 inline-block align-middle"
        />
        <p className="hidden bg-gradient-to-br from-primary-500 to-secondary-500 bg-clip-text font-cabin text-3xl font-extrabold text-transparent lg:inline-block lg:whitespace-pre-wrap lg:align-middle">
          {"Creators\nClub"}
        </p>
      </div>
      <div className="my-2 hidden h-px w-full bg-slate-200 lg:block"></div>
      <ul className="flex items-center justify-evenly gap-2 lg:my-2 lg:flex-col">
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-accent-100/50">
            <CgFeed size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Your Feed</p>
          </button>
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
          <button className="flex items-center">
            <Image
              src="https://placehold.co/32/png"
              alt="user profile picture"
              width={32}
              height={32}
              className="rounded-full"
            />
          </button>
        </li>
      </ul>
    </nav>
  );
}
