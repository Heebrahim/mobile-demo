import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";


import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Root } from './root';
import { AppError } from './error';
import { Home } from './pages/home/page';
import { MapPage } from './pages/map/page';
import { StepperForm } from './pages/form/page';
import { Dashboard } from './pages/dashboard/page';

const queryClient = new QueryClient();

const theme = extendTheme({
 colors: {
   brand: {
     900: "var(--brand)",
   },
 },
 fonts: {
   heading: "var(--font-mtn)",
   body: "var(--font-mtn)",
 },
 components: {
   Button: {
     variants: {
       solid: {
         bg: "brand.900",
         rounded: 4,
         color: "white",
       },
      
       outline: {
         rounded: 4,
         borderColor: "gray.400",
       },
     },
   },
   Input: {
     variants: {
       filled: {
         borderColor: "gray.900",
       },
     },
   },
 },
});


const router = createBrowserRouter([
 {
   path: "/",
   element: <Root />,
   errorElement: <AppError />,
   children: [
     {
       index: true,
       element: <Home />,
     },

     {
       path: "/map",

       element:  < MapPage/>
     },
     {
       path: "/form",


       element:  < StepperForm/>
     },
     {
       path: "/form/address",


       element:  < StepperForm/>
     },
     {
       path: "/dashboard",

       element:  <Dashboard/>
     },

  
   ],
  
 },
]);

createRoot(document.getElementById('root')!).render(
 <StrictMode>

<QueryClientProvider client={queryClient}>
     <ChakraProvider theme={theme} >
       <RouterProvider router={router} />
     </ChakraProvider>
   </QueryClientProvider>
 </StrictMode>,
)
