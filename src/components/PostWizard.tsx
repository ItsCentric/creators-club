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
import Image from "next/image";
import toTitleCase from "~/utils/toTitleCase";

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
    formData?.postMedia?.type ?? "",
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
      .instanceof(File)
      .refine((file) =>
        ["image/png", "image/jpg", "image/jpeg"].includes(file.type)
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
    async function uploadMedia() {
      if (!formData || isGeneratingUrl) return;
      setFormData(undefined);
      const { postContent, postMedia } = formData;
      if (!postContent) throw new Error("Content is required.");
      if (isUrlError) throw new Error(urlError?.message);
      if (postMedia && uploadUrlData) {
        await axios.put(uploadUrlData.signedUrl, postMedia);
      }
      const mediaUrl = uploadUrlData?.key
        ? `https://${
            process.env.NEXT_PUBLIC_AWS_BUCKET ?? ""
          }.s3.amazonaws.com/${uploadUrlData.key}`
        : undefined;
      props.mode === "create"
        ? createPost({
            content: postContent,
            media: mediaUrl,
          })
        : editPost({
            postId: postData?.id ?? "",
            content: postContent,
            media: mediaUrl,
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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-base">Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Let your followers know whats going on."
                        className="resize-none"
                        {...field}
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
                        accept=".png, .jpg, .jpeg"
                        className="peer h-64 w-full cursor-pointer opacity-0"
                        {...fieldProps}
                        onChange={(event) => {
                          if (!event.target.files) return;
                          onChange(event.target.files[0]);
                        }}
                        disabled={mode === "edit"}
                      />
                      <div className="absolute left-0 top-0 -z-10 flex h-full w-full items-center justify-center rounded-md peer-disabled:opacity-50">
                        {(!postData?.media || !value) && (
                          <p className="text-center text-gray-500">
                            {mode === "create"
                              ? "Click here to add an image"
                              : "No image"}
                          </p>
                        )}
                        {(value || postData?.media) && (
                          <Image
                            src={
                              value
                                ? URL.createObjectURL(value)
                                : postData?.media ?? ""
                            }
                            alt="post media"
                            fill={true}
                            className="relative max-w-full rounded-md object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Accepts .jpg, .jpeg, and .png files.
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
