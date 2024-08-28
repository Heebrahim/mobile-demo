import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


const steps = ["Info", "Address", "ID Card"];

export function StepperForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    passport: null,
    addressLine: "",
    streetName: "",
    houseNumber: "",
    proofOfAddress: "",
    addressPicture: null,
    idType: "",
    idCard: null,
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://test.polarisdigitech.net/amp/api/poc/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast({
        title: "Success",
        description: "Form submitted successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10}>
      <Stack spacing={6}>
        <Flex justify="space-between">
          {steps.map((step, index) => (
            <Box
              key={step}
              p={4}
              borderBottom="2px"
              borderColor={activeStep === index ? "blue.500" : "gray.300"}
              fontWeight={activeStep === index ? "bold" : "normal"}
            >
              {step}
            </Box>
          ))}
        </Flex>

        <FormControl>
          {activeStep === 0 && (
            <Box>
              <FormLabel>First Name</FormLabel>
              <Input
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />

              <FormLabel mt={4}>Last Name</FormLabel>
              <Input
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />

              <FormLabel mt={4}>Gender</FormLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </Select>

              <FormLabel mt={4}>Email Address</FormLabel>
              <Input
                placeholder="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              <FormLabel mt={4}>Upload Passport</FormLabel>
              <Input
                name="passport"
                type="file"
                onChange={handleChange}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Link className="underline" to="/map">
                Check map
              </Link>
              <FormLabel>Enter Address Line</FormLabel>
              <Input
                placeholder="Address Line"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
              />

              <FormLabel mt={4}>Street Name</FormLabel>
              <Input
                placeholder="Street Name"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
              />

              <FormLabel mt={4}>House Number</FormLabel>
              <Input
                placeholder="House Number"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
              />

              <FormLabel mt={4}>Proof of Address</FormLabel>
              <Select
                name="proofOfAddress"
                value={formData.proofOfAddress}
                onChange={handleChange}
              >
                <option value="nepaBill">Nepa Bill</option>
                <option value="waterBill">Water Bill</option>
              </Select>

              <FormLabel mt={4}>Upload Address Picture</FormLabel>
              <Input
                name="addressPicture"
                type="file"
                onChange={handleChange}
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <FormLabel>ID Type</FormLabel>
              <Select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
              >
                <option value="NIN">NIN</option>
                <option value="passport">In't Passport</option>
                <option value="driversLicense">Driver's License</option>
                <option value="votersCard">Voters Card</option>
              </Select>

              <FormLabel mt={4}>Upload ID Card</FormLabel>
              <Input
                name="idCard"
                type="file"
                onChange={handleChange}
              />
            </Box>
          )}
        </FormControl>

        <Flex justify="space-between" mt={6}>
          <Button
            onClick={handleBack}
            isDisabled={activeStep === 0}
            colorScheme="blue"
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} colorScheme="blue"               isLoading={isLoading}
>
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} colorScheme="blue">
              Next
            </Button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
}