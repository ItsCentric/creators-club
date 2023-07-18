import { CgFeed } from "react-icons/cg";
import { MdSearch } from "react-icons/md";
import { TbMessageCircle2 } from "react-icons/tb";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 z-10 order-2 w-full border-t border-gray-300 bg-white p-4 lg:static lg:order-first lg:w-fit lg:flex-grow lg:border-r">
      <div>
        <p className="hidden text-center font-cabin text-4xl font-extrabold lg:block">
          Creators Club
        </p>
      </div>
      <div className="my-2 hidden h-px w-full bg-slate-200 lg:block"></div>
      <ul className="flex items-center justify-evenly gap-2 lg:my-2 lg:flex-col">
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-gray-200">
            <CgFeed size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Your Feed</p>
          </button>
        </li>
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-gray-200">
            <MdSearch size={32} className="lg:mr-1 lg:inline-block" />
            <p className="hidden font-semibold lg:inline-block">Search</p>
          </button>
        </li>
        <li>
          <button className="flex items-center rounded-full px-4 py-2 hover:bg-gray-200">
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
