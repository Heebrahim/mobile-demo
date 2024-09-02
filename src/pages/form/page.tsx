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
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useURLSearchParams } from "../map/page";

const steps = ["Info", "Address", "ID Card"];
export function StepperForm() {
  const [search, setSearch] = useURLSearchParams();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Initialize state from URL params or default
  const stepFromParams = parseInt(search.get("step"), 10) || 0;
  const [activeStep, setActiveStep] = useState(stepFromParams); // Control the current step
  const [isHomeScreen, setIsHomeScreen] = useState(true); // Control home screen state
  const [initialStep, setInitialStep] = useState(true); // Control "What address are you verifying?" state
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isLoading, setIsLoading] = useState(false);


  const toast = useToast();

  // Initialize form data state
  const [formData, setFormData] = useState(() => {
    const savedData = JSON.parse(sessionStorage.getItem("formData")) || {};
    return {
      ...savedData,
      addressType: savedData.addressType || "",
      firstname: search.get("firstName") || "",
      lastname: search.get("lastName") || "",
      gender: search.get("gender") || "",
      email: search.get("email") || "",
      passport: null, // Avoid storing file object in session
      houseNumber: search.get("houseNumber") || "",
      streetName: search.get("streetName") || "",
      areaName: search.get("areaName") || "",
      lga: search.get("lga") || "",
      state: search.get("state") || "",
      latitude: search.get("latitude") || "",
      longitude: search.get("longitude") || "",
      proofOfAddress: "",
      addressPicture: null, // Avoid storing file object in session
      idType: "",
      idCard: null, // Avoid storing file object in session
    };
  });

  const validateStep = () => {
    const requiredFields = {
      0: ["firstname", "lastname", "gender", "email", "passport"],
      1: ["houseNumber", "streetName", "areaName", "lga", "state", "proofOfAddress", "addressPicture"],
      2: ["idType", "idCard"],
    };
    return requiredFields[activeStep].every((field) => formData[field]);
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === 0) {
        const { passport, addressPicture, idCard, ...dataWithoutFiles } = formData;
        sessionStorage.setItem("formData", JSON.stringify(dataWithoutFiles));
        navigate("/map?step=1");
      } else {
        setActiveStep((prev) => prev + 1);
        navigate(`/form?step=${activeStep + 1}`); // Update the URL
      }
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

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      navigate(`/form?step=${activeStep - 1}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], // Keep file in memory, not session
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      await axios.post("https://test.polarisdigitech.net/amp/api/poc/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Form submitted successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onOpen(); // Open the modal
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
    setFormData((prev) => ({
      ...prev,
      addressType: type,
    }));
    setInitialStep(false); // Move past the "What address are you verifying?" screen
  };

  useEffect(() => {
    const fieldsToPopulate = [
      "addressType",
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

    const savedData = JSON.parse(sessionStorage.getItem("formData")) || {};
    const newFormData = { ...formData, ...savedData };
    let hasChanges = false;

    fieldsToPopulate.forEach((field) => {
      const value = search.get(field);
      if (value && value !== newFormData[field]) {
        newFormData[field] = value;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFormData(newFormData);
    }

    if (stepFromParams > 0) {
      setInitialStep(false); // Don't show the initial step if coming back from a later step
      setIsHomeScreen(false); // Ensure we don't go back to home screen
      setActiveStep(stepFromParams);
    }
  }, [search]);

  useEffect(() => {
    // Persist form data in session storage without files
    const { passport, addressPicture, idCard, ...dataWithoutFiles } = formData;
    sessionStorage.setItem("formData", JSON.stringify(dataWithoutFiles));
  }, [formData]);

  return (
    <Box maxW={isMobile ? "100%" : "sm"} mx="auto" my={10} p={8} boxShadow="lg" borderRadius="lg" bg="white">
      {isHomeScreen ? (
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Welcome to Address Verification
          </Text>
          <Button colorScheme="teal" onClick={() => setIsHomeScreen(false)}>
            Start
          </Button>
        </Box>
      ) : initialStep ? (
        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            What address are you verifying?
          </Text>
          <Button colorScheme="teal" mr={2} onClick={() => handleInitialStep("Home")}>
            Home
          </Button>
          <Button colorScheme="teal" onClick={() => handleInitialStep("Work")}>
            Work
          </Button>
        </Box>
      ) : (
        <Stack spacing={6}>
          <Flex justify="space-between">
            {steps.map((step, index) => (
              <Box key={step} p={4} borderBottom="2px" borderColor={activeStep === index ? "blue.500" : "gray.300"} fontWeight={activeStep === index ? "bold" : "normal"}>
                {step}
              </Box>
            ))}
          </Flex>

          <FormControl>
            {activeStep === 0 && (
              <Box>
                <FormLabel>
                  First Name <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input isRequired placeholder="First Name" name="firstname" value={formData.firstname} onChange={handleChange} />

                <FormLabel mt={4}>
                  Last Name <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input isRequired placeholder="Last Name" name="lastname" value={formData.lastname} onChange={handleChange} />

                <FormLabel mt={4}>
                  Gender <Text as="span" color="red">*</Text>
                  </FormLabel>
                <Select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </Select>

                <FormLabel mt={4}>
                  Email Address <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Upload Passport <Text as="span" color="red">*</Text>
                </FormLabel>
                {formData.passport instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.passport)}
                    alt="Passport Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
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
                  House Number <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="House Number"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Street Name <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Street Name"
                  name="streetName"
                  value={formData.streetName}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Area Name <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="Area Name"
                  name="areaName"
                  value={formData.areaName}
                  onChange={handleChange}
                />

                <FormLabel>
                  LGA <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="LGA"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  State <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input
                  isRequired
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Upload Address Picture <Text as="span" color="red">*</Text>
                </FormLabel>
                {formData.addressPicture instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.addressPicture)}
                    alt="Address Picture Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
                <Input
                  isRequired
                  name="addressPicture"
                  type="file"
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Proof of Address <Text as="span" color="red">*</Text>
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
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <FormLabel>
                  ID Type <Text as="span" color="red">*</Text>
                </FormLabel>
                <Select name="idType" value={formData.idType} onChange={handleChange}>
                  <option value="NIN">NIN</option>
                  <option value="passport">Int'l Passport</option>
                  <option value="driversLicense">Driver's License</option>
                  <option value="votersCard">Voters Card</option>
                </Select>

                <FormLabel mt={4}>
                  ID Number <Text as="span" color="red">*</Text>
                </FormLabel>
                <Input isRequired name="idNumber" onChange={handleChange} />

                <FormLabel mt={4}>
                  Upload ID Card <Text as="span" color="red">*</Text>
                </FormLabel>
                {formData.idCard instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.idCard)}
                    alt="ID Card Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Address Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Please be patient, your address verification is in progress.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

