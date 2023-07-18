import { useState, type ReactNode } from "react";

export default function ClientError(props: {
  httpCode?: number;
  statusCode?: string;
  message?: string;
  children: ReactNode;
}) {
  const [openErrorInformation, setOpenErrorInformation] = useState(false);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded-lg bg-white p-2 shadow-lg">
        <h1 className="text-2xl font-bold">Uh oh!</h1>
        {props.children}
        <div className="mt-4">
          <p
            className="w-fit cursor-pointer text-secondary-500 underline hover:text-secondary-600"
            onClick={() => {
              setOpenErrorInformation((previousState) => !previousState);
            }}
          >
            More information
          </p>
          {openErrorInformation && (
            <div className="mt-2">
              <p>
                <span className="font-bold">HTTP Error Code:</span>{" "}
                {props.httpCode}
              </p>
              <p>
                <span className="font-bold">Status Code:</span>{" "}
                {props.statusCode}
              </p>
              <p>
                <span className="font-bold">Error Message:</span>{" "}
                {props.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
