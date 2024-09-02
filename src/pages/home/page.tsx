import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      <div
        style={{ backgroundImage: "url(firstBankBG.png)" }}
        className="h-screen bg-cover bg-center"
      >
        <div
          className="h-full lg:p-12 p-4  bg-blue-900/60 backdrop-brightness-75"
          // className="h-full lg:p-12 p-4  backdrop-brightness-75"
        >

          <main className="h-full flex flex-col">
          <div className="text-white">
           <img src="firstLogo.png" alt="" />
          </div>
          <div className="flex flex-grow items-center justify-center">
              <div className="text-center flex flex-col gap-8 ">
                <h1 className="font-bold lg:text-4xl text-xl text-[#DFAC0F]">
                  Welcome to the First Bank of Nigeria eKYC Onboarding Platform.
                </h1>

                <Link to="/form">
                  <button className="bg-[#DFAC0F] rounded-3xl px-20 py-2 font-extrabold text-lg mt-4">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

              <p className="text-white text-center ">Power By: Polaris digitech Limited</p>       

          </main>
        </div>
      </div>
    </>
  );
}
