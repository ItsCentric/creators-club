import { RedirectToUserProfile } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";

export default function RedirectToSettingsButton(props: {
  children: ReactNode;
  className?: string;
}) {
  const [redirect, setRedirect] = useState(false);

  return (
    <button className={props.className} onClick={() => setRedirect(true)}>
      {props.children}
      {redirect && <RedirectToUserProfile />}
    </button>
  );
}
