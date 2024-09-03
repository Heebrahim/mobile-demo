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

  const stepFromParams = parseInt(search.get("step"), 10) || 0;
  const [activeStep, setActiveStep] = useState(stepFromParams);
  const [initialStep, setInitialStep] = useState(true);
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
      passport: null,
      houseNumber: search.get("houseNumber") || "",
      streetName: search.get("streetName") || "",
      areaName: search.get("areaName") || "",
      lga: search.get("lga") || "",
      state: search.get("state") || "",
      latitude: search.get("latitude") || "",
      longitude: search.get("longitude") || "",
      proofOfAddress: "",
      housePicture: null,
      addressProofPicture: null,
      idType: "",
      idPicture: null,
    };
  });

  const validateStep = () => {
    const requiredFields = {
      0: ["firstname", "lastname", "gender", "email"],
      1: [
        "streetName",
        "areaName",
        "lga",
        "state",
        "proofOfAddress",
        "addressPicture",
      ],
      2: ["idType", "idCard", "passport"],
    };
    return requiredFields[activeStep].every((field) => formData[field]);
  };

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === 0) {
        const {
          passport,
          housePicture,
          addressProofPicture,
          idPicture,
          ...dataWithoutFiles
        } = formData;
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

      await axios.post(
        "https://test.polarisdigitech.net/amp/api/poc/create",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
    setInitialStep(false); 
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
      setInitialStep(false);
      setActiveStep(stepFromParams);
    }
  }, [search]);

  useEffect(() => {
    const {
      passport,
      housePicture,
      addressProofPicture,
      idPicture,
      ...dataWithoutFiles
    } = formData;
    sessionStorage.setItem("formData", JSON.stringify(dataWithoutFiles));
  }, [formData]);

  return (
    <Box
      maxW={isMobile ? "100%" : "sm"}
      mx="auto"
      my={10}
   
      boxShadow="lg"
      borderRadius="lg"
      bg="white"
    >
                <div className="text-white">
           <img src="firstLogo.png" alt="" />
          </div>
      { initialStep ? (
        <Box textAlign="center" p={8}>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            What address are you verifying?
          </Text>
          <Button
            colorScheme="teal"
            mr={2}
            onClick={() => handleInitialStep("HOME")}
          >
            Home
          </Button>
          <Button colorScheme="teal" onClick={() => handleInitialStep("OFFICE")}>
            Work
          </Button>
        </Box>
      ) : (
        <Stack spacing={6} p={8}>
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

                <FormLabel mt={4}>House Number </FormLabel>
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
                  Utility Bill{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                <Select
                  name="proofOfAddress"
                  value={formData.proofOfAddress}
                  onChange={handleChange}
                  defaultValue="WATER_BILL"
                >
                  <option value="WATER_BILL">Water Bill</option>
                  <option value="POWER_BILL">Power Bill</option>
                </Select>

                <FormLabel mt={4}>
                  Upload Utility Bill{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                {formData.addressProofPicture instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.addressProofPicture)}
                    alt="Address Proof Picture Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
                <Input
                  isRequired
                  name="addressProofPicture"
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
                  defaultValue="NIN"
                >
                  <option value="NIN">NIN</option>
                  <option value="PASSPORT">Int'l Passport</option>
                  <option value="DRIVERS_LICENCE">Driver's License</option>
                  <option value="VOTERS_CARD">Voters Card</option>
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
                {formData.idPicture instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.idPicture)}
                    alt="ID Card Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
                <Input
                  isRequired
                  name="idPicture"
                  type="file"
                  onChange={handleChange}
                />

                <FormLabel mt={4}>
                  Upload Passport Photo{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
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

                <FormLabel mt={4}>
                  Upload Address Picture{" "}
                  <Text as="span" color="red">
                    *
                  </Text>
                </FormLabel>
                {formData.housePicture instanceof File && (
                  <Image
                    src={URL.createObjectURL(formData.housePicture)}
                    alt="Address Picture Thumbnail"
                    boxSize="100px"
                    mb={2}
                  />
                )}
                <Input
                  isRequired
                  name="housePicture"
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

      <Modal isOpen={isOpen} onClose={() => {
        onClose()
        navigate("/")
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Address Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
           Thank you for completing the First Bank of Nigeria eKYC Onboarding process.
           Your verification is in progress and you will be notified once done.
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => {
              onClose()
              navigate("/")
            }}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
