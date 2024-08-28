import { Box, Center, Spinner, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";




export function Dashboard () {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();



  console.log(data)

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(
              "https://test.polarisdigitech.net/amp/api/poc/fetch"
            );
            setData(response.data);
          } catch (error) {
            setError(error);
            toast({
              title: "Error",
              description: "Failed to fetch data",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [toast]);
    
      if (loading) {
        return (
          <Center mt={10}>
            <Spinner size="xl" />
          </Center>
        );
      }
    
      if (error) {
        return (
          <Center mt={10}>
            <Text fontSize="lg" color="red.500" >
              Error fetching data. Please try again later.
            </Text>
          </Center>
        );
      }

    return (

      <div>
      </div>
      
       
    )

}