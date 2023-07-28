import { AiOutlineSearch, AiOutlineHome, AiOutlineEdit } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { BsTrash } from "react-icons/bs";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { SignUpButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import toTitleCase from "~/utils/toTitleCase";
import { useState, useEffect, useRef } from "react";
import { api } from "~/utils/api";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { z } from "zod";

export default function Navbar() {
  const trpcContext = api.useContext();
  const createPostModal = useRef<HTMLDialogElement>(null);
  const postForm = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>();
  const [mediaPreview, setMediaPreview] = useState<File>();
  const [characterCount, setCharacterCount] = useState(0);
  const { data: uploadUrlData, isFetching: isGeneratingUrl } =
    api.posts.generatePostMediaUploadUrl.useQuery(
      (formData?.get("media") as File)?.type,
      {
        enabled: !!formData,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      }
    );
  const { mutate: createPost } = api.posts.createPost.useMutation({
    onSuccess: async () => {
      postForm.current?.reset();
      setCharacterCount(0);
      createPostModal.current?.close();
      setMediaPreview(undefined);
      await trpcContext.posts.getPosts.invalidate();
    },
  });

  useEffect(() => {
    async function uploadMedia() {
      if (!formData || isGeneratingUrl) return;
      setFormData(undefined);
      const media = formData.get("media") as File | null;
      const content = formData.get("postContent") as string;
      if (media && uploadUrlData)
        await axios.put(uploadUrlData.signedUrl, media);
      const mediaUrl = uploadUrlData?.key
        ? `https://${
            process.env.NEXT_PUBLIC_AWS_BUCKET ?? ""
          }.s3.amazonaws.com/${uploadUrlData.key}`
        : undefined;
      createPost({
        content,
        media: mediaUrl,
      });
    }

    void uploadMedia();
  }, [
    uploadUrlData,
    isGeneratingUrl,
    formData,
    createPost,
    trpcContext.posts.getPosts,
  ]);

  return (
    <>
      <dialog
        className="w-4/5 max-w-lg rounded-lg"
        ref={createPostModal}
        onClose={() => postForm.current?.reset()}
      >
        <IoMdClose
          className="absolute right-2 top-2 cursor-pointer hover:text-black/80"
          size={24}
          onClick={() => createPostModal.current?.close()}
        />
        <h1 className="font-cabin text-2xl font-bold">Create Post</h1>
        <form
          ref={postForm}
          onSubmit={(e) => {
            e.preventDefault();
            setFormData(new FormData(e.currentTarget));
          }}
          className="group mt-2 flex flex-col gap-2"
        >
          <div>
            <textarea
              name="postContent"
              rows={3}
              required
              className="peer block w-full resize-none rounded-md border-gray-200 placeholder:text-gray-500 hover:border-accent-500 hover:ring-accent-500 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500"
              placeholder={"Let your followers know what you're up to"}
              onChange={(e) => {
                setCharacterCount(e.target.value.trim().length);
                const contentSchema = z.string().trim().min(1).max(1000);
                if (!contentSchema.safeParse(e.target.value).success)
                  return e.target.setCustomValidity(
                    "Content must be between 1 and 1000 characters long."
                  );
                e.target.setCustomValidity("");
              }}
            />
            <p className="float-left hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
              Content must be between 1 and 1000 characters.
            </p>
            <p className="float-right text-sm text-gray-500">
              Character count: {characterCount}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <label
              htmlFor="postMedia"
              className="mb-1 flex w-full justify-between self-start text-xl font-semibold"
            >
              <p>Media</p>
              <button
                className="rounded-lg bg-red-500 p-1 text-white enabled:hover:bg-red-600 disabled:opacity-50"
                disabled={!mediaPreview}
                onClick={() => setMediaPreview(undefined)}
              >
                <BsTrash size={20} />
              </button>
            </label>
            <label className="relative w-full cursor-pointer rounded-md border border-gray-200 hover:border-accent-500">
              <input
                type="file"
                id="postMedia"
                accept="image/png image/jpeg"
                name="media"
                className="h-64 w-full opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setMediaPreview(file);
                }}
              />
              <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
                {!mediaPreview && (
                  <p className="text-center text-gray-500">
                    Click here to add an image
                  </p>
                )}
                {mediaPreview && (
                  <Image
                    src={URL.createObjectURL(mediaPreview)}
                    alt="post media"
                    fill={true}
                    className="relative max-w-full rounded-md object-contain"
                  />
                )}
              </div>
            </label>
            <div className="mt-1"></div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary-500 px-2 py-1 hover:bg-primary-600 group-invalid:pointer-events-none group-invalid:opacity-50"
          >
            Create
          </button>
        </form>
      </dialog>
      <nav className="sticky bottom-0 z-10 order-2 w-full border-t border-gray-300 bg-white p-4 lg:static lg:order-first lg:w-fit lg:border-r lg:px-10">
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
            <button
              onClick={() => createPostModal.current?.showModal()}
              className="flex w-full items-center rounded-full hover:bg-accent-100/50 lg:px-4 lg:py-2"
            >
              <AiOutlineEdit size={32} className="lg:mr-2 lg:inline-block" />
              <p className="hidden font-semibold lg:inline-block">
                Create Post
              </p>
            </button>
          </li>
          <li>
            <UserButton />
          </li>
        </ul>
      </nav>
    </>
  );
}

function UserButton() {
  const { user, isLoaded: isUserLoaded } = useUser();

  if (!isUserLoaded)
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
      </SignedIn>
    </>
  );
}
