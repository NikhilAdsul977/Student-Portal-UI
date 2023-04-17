import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { Students } from 'src/app/models/api-models/ui-models/student-ui-model';
import { GenderService } from 'src/app/services/gender.service';
import { Gender } from 'src/app/models/api-models/ui-models/gender-ui-model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  genderList: Gender[] = [];
  constructor(private readonly studentService: StudentService,
    private readonly route: ActivatedRoute, private readonly genderService: GenderService,
    private snakebar: MatSnackBar){

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

    this.genderService.getGender()
    .subscribe(
      (successResponse) => {
        this.genderList = successResponse;
      }
    )
  }

  onUpdate() : void{
    this.studentService.updateStudent(this.student.studentId, this.student)
    .subscribe(
      (successResponse) => {
        this.student = successResponse;
        this.snakebar.open('Student Updated Successfully', undefined, {
          duration: 2000
        });
      },
      (errorResponse) => {
        this.snakebar.open('Student Updated Failed', undefined, {
          duration: 2000
        });
      }
    )
  }


}
