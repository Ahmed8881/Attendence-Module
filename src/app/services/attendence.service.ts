import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { Attendance, DateRange, ViewType, Employee, EntryForm } from '../modals/attendance-data.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private currentViewSubject = new BehaviorSubject<ViewType>('list');
  currentView$ = this.currentViewSubject.asObservable();

  private dateRangeSubject = new BehaviorSubject<DateRange>({
    start: new Date(2025, 2, 23), // March 23, 2025
    end: new Date(2025, 2, 29)    // March 29, 2025
  });
  dateRange$ = this.dateRangeSubject.asObservable();

  private selectedDateSubject = new BehaviorSubject<Date | null>(null);
  selectedDate$ = this.selectedDateSubject.asObservable();

  private showEntryFormSubject = new BehaviorSubject<boolean>(false);
  showEntryForm$ = this.showEntryFormSubject.asObservable();

  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();

  private totalPagesSubject = new BehaviorSubject<number>(5);
  totalPages$ = this.totalPagesSubject.asObservable();

  private entryFormSubject = new BehaviorSubject<EntryForm>({
    checkInTime: '',
    checkInTimeType: 'Current Day',
    checkOutTime: '',
    checkOutTimeType: 'Current Day',
    checkInNotes: '',
    checkOutNotes: ''
  });
  entryForm$ = this.entryFormSubject.asObservable();

  private attendanceData: Attendance[] = [
    {
      date: new Date(2025, 2, 23), // Sunday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: '08:00',
      overtime: '00:00',
      status: 'Weekend',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 24), // Monday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: null,
      overtime: '08:00',
      status: 'Absent',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 25), // Tuesday
      firstIn: '09:00 AM',
      lastOut: '12:04 PM',
      totalHours: '03:04',
      payableHours: '03:04',
      overtime: null,
      status: 'Present',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 26), // Wednesday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: null,
      overtime: null,
      status: 'Absent',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 27), // Thursday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: null,
      overtime: null,
      status: 'Absent',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 28), // Friday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: null,
      overtime: null,
      status: 'Absent',
      shift: 'General',
      regularization: null
    },
    {
      date: new Date(2025, 2, 29), // Saturday
      firstIn: null,
      lastOut: null,
      totalHours: null,
      payableHours: null,
      overtime: null,
      status: 'Weekend',
      shift: 'General',
      regularization: null
    }
  ];

  private employees: Employee[] = [
    {
      id: 'S2',
      name: 'Lilly Williams',
      avatar: 'assets/avatars/lilly.jpg',
      shift: 'General · 9:00 AM - 6:00 PM'
    },
    {
      id: 'S3',
      name: 'Clarkson Walter',
      avatar: 'assets/avatars/clarkson.jpg',
      shift: 'General · 9:00 AM - 6:00 PM'
    },
    {
      id: 'S19',
      name: 'Michael Johnson',
      avatar: 'assets/avatars/michael.jpg',
      shift: 'General · 9:00 AM - 6:00 PM'
    },
    {
      id: 'S20',
      name: 'Christopher Brown',
      avatar: 'assets/avatars/christopher.jpg',
      shift: 'General · 9:00 AM - 6:00 PM'
    }
  ];

  constructor() {}

  getAttendanceData(): Attendance[] {
    return this.attendanceData;
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  getMonthData(year: number, month: number): Attendance[] {
    // Create attendance data for the entire month
    const result: Attendance[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Check if we have actual data for this date
      const existingData = this.attendanceData.find(
        a => a.date.getDate() === i && 
             a.date.getMonth() === month && 
             a.date.getFullYear() === year
      );
      
      if (existingData) {
        result.push(existingData);
      } else {
        result.push({
          date: date,
          firstIn: null,
          lastOut: null,
          totalHours: null,
          payableHours: null,
          overtime: null,
          status: isWeekend ? 'Weekend' : 'Absent',
          shift: 'General',
          regularization: null
        });
      }
    }
    
    return result;
  }

  setCurrentView(view: ViewType): void {
    this.currentViewSubject.next(view);
  }

  setDateRange(range: DateRange): void {
    this.dateRangeSubject.next(range);
  }

  setSelectedDate(date: Date | null): void {
    this.selectedDateSubject.next(date);
  }

  setShowEntryForm(show: boolean): void {
    this.showEntryFormSubject.next(show);
  }

  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  updateEntryForm(form: Partial<EntryForm>): void {
    this.entryFormSubject.next({
      ...this.entryFormSubject.value,
      ...form
    });
  }

  resetEntryForm(): void {
    this.entryFormSubject.next({
      checkInTime: '',
      checkInTimeType: 'Current Day',
      checkOutTime: '',
      checkOutTimeType: 'Current Day',
      checkInNotes: '',
      checkOutNotes: ''
    });
  }

  navigatePrevious(): void {
    const currentRange = this.dateRangeSubject.value;
    const daysDiff = Math.round((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const newStart = new Date(currentRange.start);
    newStart.setDate(newStart.getDate() - daysDiff - 1);
    
    const newEnd = new Date(currentRange.end);
    newEnd.setDate(newEnd.getDate() - daysDiff - 1);
    
    this.setDateRange({ start: newStart, end: newEnd });
  }

  navigateNext(): void {
    const currentRange = this.dateRangeSubject.value;
    const daysDiff = Math.round((currentRange.end.getTime() - currentRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const newStart = new Date(currentRange.start);
    newStart.setDate(newStart.getDate() + daysDiff + 1);
    
    const newEnd = new Date(currentRange.end);
    newEnd.setDate(newEnd.getDate() + daysDiff + 1);
    
    this.setDateRange({ start: newStart, end: newEnd });
  }

  navigateToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesSubject.value) {
      this.currentPageSubject.next(page);
    }
  }
  getCurrentPage(): number {
    let currentPage = 1;
    this.currentPage$.pipe(take(1)).subscribe(page => {
      currentPage = page;
    });
    return currentPage;
  }

  getTotalPages(): number {
    let totalPages = 1;
    this.totalPages$.pipe(take(1)).subscribe(pages => {
      totalPages = pages;
    });
    return totalPages;
  }
}