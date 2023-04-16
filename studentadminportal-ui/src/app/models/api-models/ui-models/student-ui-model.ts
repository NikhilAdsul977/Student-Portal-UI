import { Address } from "./address-ui-model"
import { Gender } from "./gender-ui-model"

export interface Students{
  studentId: string,
  studentFirstName: string,
  studentLastname: string,
  mobile:string
  email:string,
  dob:string,
  profileImageUrl:string,
  genderId:string,
  gender:Gender
  address:Address
}
