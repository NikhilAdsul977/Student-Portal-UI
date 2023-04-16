import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Students } from '../models/api-models/api-models/student-model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = 'http://localhost:7255/api/Students'

  constructor(private httpClient: HttpClient) { }

  getStudents() : Observable<Students[]>{
    return this.httpClient.get<Students[]>(this.baseUrl+'/GetAllStudent')
  }

  getStudent(studentId: string) : Observable<Students>{
    return this.httpClient.get<Students>(this.baseUrl+'/GetStudentById/'+studentId)
  }
}
