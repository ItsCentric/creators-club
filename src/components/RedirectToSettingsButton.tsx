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
}) {
  const [redirect, setRedirect] = useState(false);

  return (
    <Button
      variant={props.variant ?? "default"}
      onClick={() => setRedirect(true)}
    >
      {props.children}
      {redirect && <RedirectToUserProfile />}
    </Button>
  );
}
