import { Input } from "@chakra-ui/react";

export default function AccountForm() {
  return (
    <div>
      <Input placeholder="First Name" name="firstName" />
      <Input placeholder="Last Name" name="lastName" />
      <Input placeholder="Other Names" name="otherNames" />
      <Input placeholder="Date of Birth" name="dateOfBirth" type="date" />
      <Input placeholder="Phone Number" name="phoneNumber" />
      <Input placeholder="Email" name="email" type="email" />
      <Input placeholder="Passport" name="passport" type="file" />
    </div>
  );
}
