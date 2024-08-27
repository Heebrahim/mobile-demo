import { Button } from "@chakra-ui/react";




export function AppError() {


  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-2">
      <h1 className="text-3xl font-semibold text-gray-400">
        An error occurred
      </h1>

      <Button size="sm" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
