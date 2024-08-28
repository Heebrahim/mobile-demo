import { Button, Input } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function AddressForm() {
  return (
    <div>
      <Input placeholder="House Number" name="houseNumber" />
      <Input placeholder="Street Name" name="streetName" />
      <Input placeholder="Area Name" name="areaName" />
      <Input placeholder="LGA" name="lga" />
      <Input placeholder="State" name="state" />
      <Input placeholder="Picture" name="picture" type="file" />
      <Input placeholder="Nearest Bus Stop (Optional)" name="nearestBusStop" />
      <Input placeholder="Nearest Landmark (Optional)" name="nearestLandmark" />
      
      <Button as={Link} to="/map">
        Search Address on Map
      </Button>
    </div>
  );
}
