import { RedirectToUserProfile } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";
import { Button } from "./ui/button";

export default function RedirectToSettingsButton(props: {
  children: ReactNode;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const [redirect, setRedirect] = useState(false);

  return (
    <Button
      variant={props.variant ?? "default"}
      size={props.size ?? "default"}
      onClick={() => setRedirect(true)}
      className="font-semibold"
    >
      {props.children}
      {redirect && <RedirectToUserProfile />}
    </Button>
  );
}
