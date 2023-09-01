import { useState, useEffect } from "react";
import { type RouterOutputs, api } from "~/utils/api";
import { useToast } from "./ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { BsTrash } from "react-icons/bs";
import { Input } from "./ui/input";
import toTitleCase from "~/utils/toTitleCase";
import MediaCarousel from "./MediaCarousel";

export default function PostWizard(props: {
  mode: "create" | "edit";
  children: React.ReactNode;
  postData?: RouterOutputs["posts"]["getPosts"]["posts"][number];
  dropdown?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { mode, postData, children } = props;
  const trpcContext = api.useContext();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema>>();
  const [characterCount, setCharacterCount] = useState(0);
  const { toast } = useToast();
  const {
    data: uploadUrlData,
    isFetching: isGeneratingUrl,
    isError: isUrlError,
    error: urlError,
  } = api.posts.generatePostMediaUploadUrl.useQuery(
    formData?.postMedia?.map((media) => media.type) ?? [],
    {
      enabled: !!formData?.postMedia,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  const { mutate: createPost } = api.posts.createPost.useMutation({
    onSuccess: async () => {
      form.reset();
      setCharacterCount(0);
      props.onOpenChange ? props.onOpenChange(false) : setOpen(false);
      await trpcContext.posts.getPosts.invalidate();
      toast({
        title: "Post created",
        description: "Go check out your new post!",
        variant: "success",
      });
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Well, that's embarrassing...",
        description: `Something went wrong while creating your post. Please try again.\n\nCode: ${
          e.data?.code ?? "INTERNAL_SERVER_ERROR"
        }\nMessage: ${e.message}`,
        variant: "destructive",
      });
    },
  });
  const { mutate: editPost } = api.posts.editPost.useMutation({
    onSuccess: async () => {
      form.reset();
      setCharacterCount(0);
      props.onOpenChange ? props.onOpenChange(false) : setOpen(false);
      await trpcContext.posts.getPosts.invalidate();
      toast({
        title: "Post updated",
        description: "Go check out your updated post!",
        variant: "success",
      });
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Well, that's embarrassing...",
        description: `Something went wrong while updating your post. Please try again.\n\nCode: ${
          e.data?.code ?? "INTERNAL_SERVER_ERROR"
        }\nMessage: ${e.message}`,
        variant: "destructive",
      });
    },
  });
  const formSchema = z.object({
    postContent: z.string().trim().min(1).max(1000),
    postMedia: z
      .array(z.instanceof(File))
      .max(3, { message: "You can only upload up to 3 images or videos" })
      .refine(
        (fileArray) => {
          return fileArray.every((file) =>
            ["video", "image"].includes(file.type.split("/")[0] ?? "")
          );
        },
        { message: "Only images and videos are allowed" }
      )
      .refine(
        (fileArray) => {
          return Promise.all(
            fileArray.map((file) => {
              if (file.type.includes("image")) {
                return new Promise<boolean>((resolve) => {
                  const image = new Image();
                  image.src = URL.createObjectURL(file);
                  image.onload = () => {
                    const isValid =
                      image.width / image.height === 16 / 9 ||
                      image.width / image.height === 1;
                    resolve(isValid);
                  };
                });
              }
              if (file.type.includes("video")) {
                return new Promise<boolean>((resolve) => {
                  const video = document.createElement("video");
                  video.src = URL.createObjectURL(file);
                  video.onloadedmetadata = () => {
                    const isValid =
                      video.videoWidth / video.videoHeight === 16 / 9 ||
                      video.videoWidth / video.videoHeight === 1;
                    resolve(isValid);
                  };
                });
              }
            })
          ).then((results) => results.every((isValid) => isValid));
        },
        { message: "Only images with a 16:9 or 1:1 aspect ratio are allowed" }
      )
      .refine(
        (fileArray) => {
          const maxFileSizeInMegabytes = 20;
          return fileArray.every(
            (file) => file.size / 1024 / 1024 <= maxFileSizeInMegabytes
          );
        },
        { message: "Files must be less than 20MB" }
      )
      .optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postContent: postData?.content ?? "",
    },
  });

  useEffect(() => {
    if (postData) {
      form.reset({ postContent: postData.content });
    }
  }, [form, postData]);

  const mediaTypeParser = z.enum(["IMAGE", "VIDEO"]);
  useEffect(() => {
    async function uploadMedia() {
      if (!formData || isGeneratingUrl) return;
      setFormData(undefined);
      const { postContent, postMedia } = formData;
      if (!postContent) throw new Error("Content is required.");
      if (isUrlError) throw new Error(urlError?.message);
      if (postMedia && uploadUrlData) {
        for (const urlData of uploadUrlData) {
          const index = uploadUrlData.indexOf(urlData);
          await axios.put(urlData.signedUrl, postMedia[index]);
        }
      }
      const mediaUrl = uploadUrlData?.map((urlData, i) => {
        const splitMedia = formData?.postMedia?.[i]?.type.split("/");
        const mediaType = mediaTypeParser.parse(splitMedia?.[0]?.toUpperCase());
        const mediaFormat = splitMedia?.[1];
        if (!mediaType || !mediaFormat)
          throw new Error("Failed to parse media type.");

        return {
          id: urlData.key,
          url: `https://${
            process.env.NEXT_PUBLIC_AWS_BUCKET ?? ""
          }.s3.amazonaws.com/${urlData.key}`,
          type: mediaType,
          format: mediaFormat,
        };
      });
      props.mode === "create"
        ? createPost({
            content: postContent,
            media: mediaUrl,
          })
        : editPost({
            postId: postData?.id ?? "",
            content: postContent,
          });
    }

    void uploadMedia().catch((e: Error) => {
      console.error(e);
      toast({
        title: "Well, that's embarrassing...",
        description:
          "Something went wrong while creating your post. Please try again.\n\nMessage: " +
          e.message,
        variant: "destructive",
      });
    });
  }, [
    createPost,
    editPost,
    formData,
    isGeneratingUrl,
    isUrlError,
    mediaTypeParser,
    postData?.id,
    props.mode,
    toast,
    uploadUrlData,
    urlError?.message,
  ]);

  return (
    <Dialog
      open={props.open ? props.open : open}
      onOpenChange={
        props.onOpenChange
          ? (newOpen) => {
              props.onOpenChange?.(newOpen);
              form.reset({ postContent: postData?.content });
              setCharacterCount(postData?.content.length ?? 0);
            }
          : (newOpen) => {
              setOpen(newOpen);
              form.reset();
              setCharacterCount(0);
            }
      }
    >
      {props.dropdown && children}
      {!props.dropdown && (
        <DialogTrigger className="w-full">{children}</DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{toTitleCase(mode)} Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(setFormData)(e);
            }}
          >
            <FormField
              control={form.control}
              name="postContent"
              defaultValue={postData?.content ?? ""}
              render={({ field: { onChange, ...fieldProps } }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-base">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        onChange={(e) => {
                          setCharacterCount(e.target.value.length);
                          onChange(e);
                        }}
                        placeholder="Let your followers know whats going on."
                        className="resize-none"
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormDescription>
                      Character count: {characterCount}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="postMedia"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between text-base">
                    <p>Media</p>
                    <Button
                      type="reset"
                      variant="destructive"
                      size="icon"
                      disabled={!form.getValues("postMedia") || mode === "edit"}
                      onClick={() => {
                        onChange(undefined);
                        form.setValue("postMedia", undefined);
                      }}
                    >
                      <BsTrash size={24} />
                    </Button>
                  </FormLabel>
                  <FormControl className="relative rounded-md border border-muted">
                    <div>
                      <Input
                        type="file"
                        accept="image/*, video/*"
                        className="peer h-64 w-full cursor-pointer opacity-0"
                        {...fieldProps}
                        onChange={(event) => {
                          if (!event.target.files) return;
                          onChange(Array.from(event.target.files ?? []));
                        }}
                        multiple
                        disabled={mode === "edit"}
                      />
                      {!value && !postData?.media && (
                        <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-500">
                          Click to add an image
                        </p>
                      )}
                      <MediaCarousel
                        media={(value || postData?.media) ?? []}
                        alt={postData?.content ?? ""}
                        className="pointer-events-none absolute left-0 top-0 h-full w-full peer-disabled:opacity-50"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Accepts any image or video file under 20MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-2 w-full text-center"
              disabled={
                form.formState.defaultValues?.postContent ===
                form.getValues("postContent")
              }
            >
              {toTitleCase(mode)}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
