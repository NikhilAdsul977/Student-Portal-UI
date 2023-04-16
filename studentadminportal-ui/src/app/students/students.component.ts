import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentService } from './student.service';
//import { Students } from '../models/api-models/api-models/student-model';
import { Students } from '../models/api-models/ui-models/student-ui-model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit{

  students: Students[] = []
  displayedColumns: string[] = ['studentFirstName', 'studentLastname', 'dob', 'mobile', 'email', 'gender'];
  dataSource : MatTableDataSource<Students> = new MatTableDataSource<Students>();
  @ViewChild(MatPaginator) matPaginator! : MatPaginator;
  @ViewChild(MatSort) matSort! : MatSort;
  filterString = '';

  constructor(private studentService: StudentService){

  }

  ngOnInit(): void {
    this.studentService.getStudent()
    .subscribe(
      (successResponse)=>{
        this.students = successResponse
        this.dataSource = new MatTableDataSource<Students>(this.students);

        if(this.matPaginator){
          this.dataSource.paginator = this.matPaginator;
        }
        if(this.matSort){
          this.dataSource.sort = this.matSort;
        }
      },
      (errorResponse) => {
        console.log(errorResponse)
      }
    );
  }

  filterStudents(){
    this.dataSource.filter = this.filterString.trim().toLowerCase();
  }

}
