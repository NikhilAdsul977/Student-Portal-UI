import { Address } from "./address-model"
import { Gender } from "./gender-model"

export interface Students{
  studentId: string,
  studentFirstName: string,
  studentLastname: string,
  mobile:number,
  email:string,
  dob:string,
  profileImageUrl:string,
  genderId:string,
  gender:Gender
  address:Address
}
