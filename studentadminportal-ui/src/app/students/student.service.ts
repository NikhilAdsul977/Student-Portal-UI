import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Students } from '../models/api-models/api-models/student-model';
import { UpdateStudentRequest } from '../models/api-models/api-models/update-student-request';
import { AddStudentRequest } from '../models/api-models/api-models/add-student-request';


@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = 'http://localhost:7255/'

  constructor(private httpClient: HttpClient) { }

  getStudents() : Observable<Students[]>{
    return this.httpClient.get<Students[]>(this.baseUrl+'api/Students/GetAllStudent')
  }

  getStudent(studentId: string) : Observable<Students>{
    return this.httpClient.get<Students>(this.baseUrl+'api/Students/GetStudentById/'+studentId)
  }

  updateStudent(studentId: string, studentRequest: Students) : Observable<Students>{
    const updateStudentRequest: UpdateStudentRequest = {
      studentFirstName : studentRequest.studentFirstName,
      studentLastname : studentRequest.studentLastname,
      dob : studentRequest.dob,
      mobile : studentRequest.mobile,
      email : studentRequest.email,
      genderId : studentRequest.genderId,
      streetAdress : studentRequest.address.streetAdress,
      zipCode : studentRequest.address.zipCode
    }

    return this.httpClient.put<Students>(this.baseUrl + 'api/Students/UpdateStudent/'+studentId, updateStudentRequest);
  }

  deleteSudent(studentId: string) : Observable<void>{
    return this.httpClient.delete<void>(this.baseUrl + 'api/Students/DeleteStudent/'+studentId);
  }

  addStudent(studentRequest: Students) : Observable<Students>{
    const addStudentRequest: AddStudentRequest = {
      studentFirstName : studentRequest.studentFirstName,
      studentLastname : studentRequest.studentLastname,
      dob : studentRequest.dob,
      mobile : studentRequest.mobile,
      email : studentRequest.email,
      genderId : studentRequest.gender.genderId,
      streetAdress : studentRequest.address.streetAdress,
      zipCode : studentRequest.address.zipCode
    }

    return this.httpClient.post<Students>(this.baseUrl + 'api/Students/AddStudent', addStudentRequest);
  }

  uploadImage(studentId: string, file : File) : Observable<any>{
    const formData = new FormData();
    formData.append("profileImage", file);

    return this.httpClient.post(this.baseUrl+'api/Students/UploadProfile/'+studentId, formData, {responseType: 'text'});
  }

  getImagePath(relativePath: string){
    return this.baseUrl+relativePath

  }
}
