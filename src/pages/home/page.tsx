import { Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";



export function Home () {
  return (
    <>
        <div
      style={{ backgroundImage: "url(bg.jpg)" }}
      className="h-screen bg-cover bg-center"
    >
      <div
        //className="h-full lg:p-12 p-4  bg-blue-500/50 backdrop-brightness-75"
        className="h-full lg:p-12 p-4  backdrop-brightness-75"
      >
        <main className="h-full flex items-center justify-center ml-auto">

        <div className="flex flex-col items-center justify-center gap-8" >
        <h1 className="font-bold text-2xl">Welcome to PDL Digital Address Verification</h1>


        <div className="flex gap-4 justify-center">
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/form">
        <Button>Get Started</Button>
      </Link>
        </div>

       



        </div>


 
      </main>
    </div>
    </div>
    
    </>
  )
}