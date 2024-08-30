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
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useURLSearchParams } from "../map/page";

const steps = ["Info", "Address", "ID Card"];

export function StepperForm() {
  const [search, setSearch] = useURLSearchParams();

  const stepFromParams = parseInt(search.get("step"), 10) ?? 0;

  const [activeStep, setActiveStep] = useState(stepFromParams || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [initialStep, setInitialStep] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [addressType, setAddressType] = useState("");
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstname: search.get("firstName") || "",
    lastname: search.get("lastName") || "",
    gender: search.get("gender") || "",
    email: search.get("email") || "",
    passport: null,
    houseNumber: search.get("houseNumber") || "",
    streetName: search.get("streetName") || "",
    areaName: search.get("areaName") || "",
    lga: search.get("lga") || "",
    state: search.get("state") || "",
    latitude: search.get("latitude") || "",
    longitude: search.get("longitude") || "",
    proofOfAddress: "",
    addressPicture: null,
    idType: "",
    idCard: null,
  });

  const validateStep = () => {
    const requiredFields = {
      0: ["firstname", "lastname", "gender", "email", "passport"],
      1: [
        "streetName",
        "areaName",
        "lga",
        "state",
        "proofOfAddress",
        "addressPicture",
      ],
      2: ["idType", "idCard"],
    };
    return requiredFields[activeStep].every((field) => formData[field]);
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    } else {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

      console.log(response);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Something went wrong.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialStep = (type) => {
    setAddressType(type);
    setInitialStep(false);
    setActiveStep(0)
  };

  useEffect(() => {
    const fieldsToPopulate = [
      "firstname",
      "lastname",
      "gender",
      "email",
      "houseNumber",
      "streetName",
      "areaName",
      "lga",
      "state",
      "latitude",
      "longitude",
    ];
    fieldsToPopulate.forEach((field) => {
      const value = search.get(field);
      if (value) {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    });
    if (stepFromParams > 0) {
      setInitialStep(false);
      setActiveStep(stepFromParams);
    }


  }, [search]);

  return (
    <Box
      maxW={isMobile ? "100%" : "sm"}
      mx="auto"
      my={10}
      p={8}
      boxShadow="lg"
      borderRadius="lg"
      bg="white"
    >
      {/* Initial Question */}
      {initialStep ? (
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            What address are you verifying?
          </Text>
          <Button
            colorScheme="teal"
            mr={2}
            onClick={() => handleInitialStep("Home")}
          >
            Home
          </Button>
          <Button colorScheme="teal" onClick={() => handleInitialStep("Work")}>
            Work
          </Button>
        </Box>
      ) : (
        // Stepper Form
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
                <FormLabel>
                  First Name{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Last Name{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Gender{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </Select>

                <FormLabel mt={4}>
                  Email Address{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Upload Passport{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  name="passport"
                  type="file"
                  onChange={handleChange}
                />
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Button>

                <Link className="" to="/map">
                  Map
                </Link>
                </Button>
                <input type="text" hidden name="longitude" />
                <input type="text" hidden name="latitude" />

                <FormLabel mt={4}>
                  House Number
                </FormLabel>
                <Input
                  isRequired
                  placeholder="House Number"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Street Name{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Street Name"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Area Name{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Area Name"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                />

                <FormLabel>
                  LGA{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="LGA"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  State{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
                                <FormLabel mt={4}>
                  Upload Address Picture{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  name="addressPicture"
                  type="file"
                  onChange={handleChange}
                />
                <FormLabel mt={4}>
                  Proof of Address{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="proofOfAddress"
                  value={formData.proofOfAddress}
                  onChange={handleChange}
                  defaultValue="nepaBill"
                >
                  <option value="nepaBill">Nepa Bill</option>
                  <option value="waterBill">Water Bill</option>
                </Select>
                <FormLabel mt={4}>
                  Upload proof of Address{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
                  name="addressPicture"
                  type="file"
                  onChange={handleChange}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <FormLabel>
                  ID Type{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                >
                  <option value="NIN">NIN</option>
                  <option value="passport">Int'l Passport</option>
                  <option value="driversLicense">Driver's License</option>
                  <option value="votersCard">Voters Card</option>
                </Select>

                <FormLabel mt={4}>
                  ID Number{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input isRequired name="idNumber" onChange={handleChange} />

                <FormLabel mt={4}>
                  Upload ID Card{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Input
                  isRequired
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
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                isLoading={isLoading}
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
      )}
    </Box>
  );
}
