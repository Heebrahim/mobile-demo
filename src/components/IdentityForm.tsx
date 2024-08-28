import { Input } from "@chakra-ui/react";

export default function IdentityForm() {
  return (
    <div>
      <Input placeholder="ID Number" name="idNumber" />
      <Input placeholder="ID Type" name="idType" />
      <Input placeholder="ID Picture" name="picture" type="file" />
      <Input placeholder="Date of Issue (Optional)" name="dateIssue" type="date" />
      <Input placeholder="Date of Expiration (Optional)" name="dateOfExpiration" type="date" />
    </div>
  );
}
