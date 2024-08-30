import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      <div
        style={{ backgroundImage: "url(bg.jpg)" }}
        className="h-screen bg-cover bg-center"
      >
        <div
          className="h-full lg:p-12 p-4  bg-blue-500/50 backdrop-brightness-75"
          // className="h-full lg:p-12 p-4  backdrop-brightness-75"
        >
          <div className="text-white">
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <main className="h-full flex flex-col justify-center gap-8 text-center ml-auto">
              <h1 className="font-bold lg:text-4xl text-lg text-white">
                Welcome to PDL Digital Address Verification
              </h1>

              <Link to="/form">
                <Button>App Demo</Button>
              </Link>
          </main>

          <div className="text-center">
            <p>Power by: Polaris digitech Limited 2024</p>
          </div>
        </div>
      </div>
    </>
  );
}
