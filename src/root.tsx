import {  Progress } from "@chakra-ui/react";
import { Outlet, useNavigation } from "react-router-dom";



export  function Root () {

    const navigation = useNavigation();
    return (

        <>
        {navigation.state === "loading" && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <Progress size="lg" isIndeterminate className="w-full" />
          </div>
        )}
        <Outlet />
      </>

    )
}