import { MdOutlineSearchOff } from "react-icons/md";

export default function HomeFeed() {
  return (
    <div className="flex h-full flex-grow-[8] flex-col items-center justify-center p-4 text-center font-montserrat font-medium">
      <MdOutlineSearchOff
        size={48}
        className="mb-2 rounded-full border-2 border-black p-1"
      />
      <h1>No posts yet!</h1>
      <p>
        Start by <span className="text-accent">following a creator</span> to
        grow your personalized feed.
      </p>
    </div>
  );
}
