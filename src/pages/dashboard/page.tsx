import {
  Box,
  Center,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Image,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

export function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

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
        <Text fontSize="lg" color="red.500">
          Error fetching data. Please try again later.
        </Text>
      </Center>
    );
  }

  return (
    <Box>
      <header className="flex items-center justify-between h-[5rem] px-6 border-b border-b-gray-400/50 backdrop-blur bg-[var(--brand-color)] relative z-10">
        <Flex className="items-center">
          <div className="flex justify-between">
            <h2 className="text-lg md:text-2xl text-blue">Dashboard</h2>
          </div>
        </Flex>
        <Menu>
          <MenuButton className="p-1 text-lg bg-[var(--brand)] border border-[var(--secondary-color)] rounded"></MenuButton>
          <MenuList style={{ backgroundColor: "var(--main-color)" }}>
            <MenuItem
              as={Link}
              sx={{
                backgroundColor: "var(--brand-color)",
              }}
            >
              Change Password
            </MenuItem>
            <MenuItem
              sx={{
                backgroundColor: "var(--brand-color)",
              }}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </header>

      <Table variant="simple" mt={4}>
        <Thead>
          <Tr>
            <Th>S/N</Th>
            <Th>Full Name</Th>
            <Th>Address Line</Th>
            <Th>Latitude</Th>
            <Th>Longitude</Th>
            <Th>Email</Th>
            <Th>ID Card</Th>
            <Th>Passport</Th>
            <Th>Phone</Th>
            <Th>Status</Th>
            <Th>Proof of Address</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => (
            <Tr key={item.id}>
              <Td>{index + 1}</Td>
              <Td>{`${item.firstname} ${item.lastname}`}</Td>
              <Td>{`${item.address.houseNumber} ${item.address.streetName}, ${item.address.areaName}, ${item.address.lga}, ${item.address.state}`}</Td>
              <Td>{item.address.latitude.toFixed(2)}</Td>
              <Td>{item.address.longitude.toFixed()}</Td>
              <Td>{item.email}</Td>
              <Td>
                {item.identity?.picture && (
                  <Image
                    src={item.identity.picture}
                    alt="ID Card"
                    boxSize="50px"
                    objectFit="cover"
                  />
                )}
              </Td>
              <Td>
                {item.passport && (
                  <Image
                    src={item.passport}
                    alt="Passport"
                    boxSize="50px"
                    objectFit="cover"
                  />
                )}
              </Td>
              <Td>{item.phoneNumber}</Td>
              <Td>{item.address.status || "N/A"}</Td>
              <Td>{item.address.proofOfAddress || "N/A"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}