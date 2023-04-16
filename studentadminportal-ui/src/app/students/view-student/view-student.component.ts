import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { Students } from 'src/app/models/api-models/ui-models/student-ui-model';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit{

  studentId!: string | null;
  student: Students = {
    studentId : '',
    studentFirstName : '',
    studentLastname : '',
    mobile : 0,
    email : '',
    dob : '',
    profileImageUrl : '',
    genderId: '',
    gender : {
      genderId: '',
      name: ''
    },
    address : {
      addressId: '',
      streetAdress: '',
      zipCode: ''
    }
  }
  constructor(private readonly studentService: StudentService,
    private readonly route: ActivatedRoute){

    }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        this.studentId = params.get('id');

        if(this.studentId){
          this.studentService.getStudent(this.studentId)
          .subscribe(
            (successResponse) => {
              this.student = successResponse;
            }
          );
        }
      }
    );
  }

}
