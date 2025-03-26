import { Component, OnInit, HostListener } from '@angular/core';
import { AttendanceService } from '../services/attendence.service';
import { Attendance, DateRange, ViewType, Employee, EntryForm } from '../modals/attendance-data.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendence',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl:'./attendence.component.html',
  styleUrl: './attendence.component.scss',
})
export class AttendenceComponent implements OnInit {
  currentView$: Observable<ViewType>;
  dateRange$: Observable<DateRange>;
  selectedDate$: Observable<Date | null>;
  showEntryForm$: Observable<boolean>;
  currentPage$: Observable<number>;
  totalPages$: Observable<number>;
  entryForm$: Observable<EntryForm>;
  
  attendanceData: Attendance[] = [];
  monthData: Attendance[] = [];
  employees: Employee[] = [];
  notes: string = '';
  showDateDetail: boolean = false;
  selectedDateDetail: Date | null = null;
  selectedAttendance: Attendance | null = null;
  calendarWeeks: number[][] = [];

  constructor(private attendanceService:AttendanceService) {
    this.currentView$ = this.attendanceService.currentView$;
    this.dateRange$ = this.attendanceService.dateRange$;
    this.selectedDate$ = this.attendanceService.selectedDate$;
    this.showEntryForm$ = this.attendanceService.showEntryForm$;
    this.currentPage$ = this.attendanceService.currentPage$;
    this.totalPages$ = this.attendanceService.totalPages$;
    this.entryForm$ = this.attendanceService.entryForm$;
  }

  ngOnInit(): void {
    this.attendanceData = this.attendanceService.getAttendanceData();
    this.employees = this.attendanceService.getEmployees();
    
    this.dateRange$.subscribe(range => {
      this.monthData = this.attendanceService.getMonthData(
        range.start.getFullYear(),
        range.start.getMonth()
      );
      
      // Pre-calculate calendar weeks to avoid doing it in the template
      this.calendarWeeks = this.calculateWeeksInMonth(
        range.start.getFullYear(),
        range.start.getMonth()
      );
    });
  }

  @HostListener('document:keydown.escape')
  closeAllPopups(): void {
    this.closeDateDetail();
    this.closeEntryForm();
  }

  setView(view: ViewType): void {
    this.attendanceService.setCurrentView(view);
  }

  navigatePrevious(): void {
    this.attendanceService.navigatePrevious();
  }

  navigateNext(): void {
    this.attendanceService.navigateNext();
  }

  selectDate(date: Date, attendance: Attendance): void {
    if (attendance.status === 'Present') {
      this.selectedDateDetail = date;
      this.showDateDetail = true;
    }
  }

  closeDateDetail(): void {
    this.showDateDetail = false;
    this.selectedDateDetail = null;
  }

 

  saveEntry(): void {
    // Here you would implement the logic to save the entry
    this.closeEntryForm();
  }

  applyLeave(): void {
    // Here you would implement the logic to apply for leave
    this.closeEntryForm();
  }

  navigateToPage(page: number): void {
    this.attendanceService.navigateToPage(page);
  }

  updateEntryForm(field: string, value: string): void {
    const update: Partial<EntryForm> = {};
    update[field as keyof EntryForm] = value;
    this.attendanceService.updateEntryForm(update);
  }

  formatDateRange(range: DateRange): string {
    const formatDate = (date: Date) => {
      return `${date.getDate()}-${this.getMonthName(date.getMonth()).substring(0, 3)}-${date.getFullYear()}`;
    };
    
    if (this.isSameMonth(range.start, range.end)) {
      return `${this.getMonthName(range.start.getMonth())} ${range.start.getFullYear()}`;
    }
    
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  }

  formatDate(date: Date): string {
    return `${this.getDayName(date)}, ${date.getDate()} ${this.getMonthName(date.getMonth())} ${date.getFullYear()}`;
  }

  private isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }

  getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  }

  getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  getFullDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  getStatusClass(status: string | null): string {
    if (!status) return '';
    
    switch(status) {
      case 'Present': return 'status-present';
      case 'Absent': return 'status-absent';
      case 'Weekend': return 'status-weekend';
      default: return '';
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  // Helper method to create a date safely
  createDate(year: number, month: number, day: number): Date {
    return new Date(year, month, day);
  }

  // Fixed method to calculate weeks in month
  calculateWeeksInMonth(year: number, month: number): number[][] {
    try {
      const weeks: number[][] = [];
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Create a new array for the first week
      let currentWeek: number[] = [];
      
      // Fill in the days before the first day of the month
      for (let i = 0; i < firstDay.getDay(); i++) {
        currentWeek.push(0);
      }
      
      // Fill in all days of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        currentWeek.push(day);
        
        // If we've filled a week, push it to our weeks array and start a new week
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
      
      // If we have a partial week left, fill it with zeros and add it
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(0);
        }
        weeks.push([...currentWeek]);
      }
      
      return weeks;
    } catch (error) {
      console.error('Error calculating weeks:', error);
      // Return a safe default if there's an error
      return [[0, 0, 0, 0, 0, 0, 0]];
    }
  }

  getAttendanceForDay(day: number, month: number, year: number): Attendance | null {
    if (day === 0) return null;
    
    try {
      return this.monthData.find(a => 
        a.date.getDate() === day && 
        a.date.getMonth() === month && 
        a.date.getFullYear() === year
      ) || null;
    } catch (error) {
      console.error('Error getting attendance for day:', error);
      return null;
    }
  }

  getProgressPosition(attendance: Attendance): { start: string, end: string } {
    if (!attendance.firstIn || !attendance.lastOut) {
      return { start: '0%', end: '0%' };
    }

    try {
      // Parse times
      const startTime = this.parseTime(attendance.firstIn);
      const endTime = this.parseTime(attendance.lastOut);
      
      // Calculate positions (assuming 9AM-6PM is 0%-100%)
      const dayStart = 9; // 9 AM
      const dayEnd = 18; // 6 PM
      const dayLength = dayEnd - dayStart;
      
      const startHour = startTime.hours + (startTime.minutes / 60);
      const endHour = endTime.hours + (endTime.minutes / 60);
      
      const startPos = Math.max(0, Math.min(100, ((startHour - dayStart) / dayLength) * 100));
      const endPos = Math.max(0, Math.min(100, ((endHour - dayStart) / dayLength) * 100));
      
      return {
        start: `${startPos}%`,
        end: `${endPos}%`
      };
    } catch (error) {
      console.error('Error parsing time:', error);
      return { start: '0%', end: '0%' };
    }
  }

  parseTime(timeStr: string): { hours: number, minutes: number } {
    try {
      // Parse time strings like "09:00 AM" or "12:04 PM"
      const parts = timeStr.split(' ');
      if (parts.length !== 2) {
        throw new Error(`Invalid time format: ${timeStr}`);
      }
      
      const [time, period] = parts;
      const [hoursStr, minutesStr] = time.split(':');
      
      if (!hoursStr || !minutesStr) {
        throw new Error(`Invalid time format: ${timeStr}`);
      }
      
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error(`Invalid time values: ${timeStr}`);
      }
      
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return { hours, minutes };
    } catch (error) {
      console.error('Error parsing time:', error);
      return { hours: 0, minutes: 0 };
    }
  }
  // Add this property to the AttendanceComponent class
showAddEntryForm: boolean = false;

// Add this method to the AttendanceComponent class
toggleAddEntryForm(): void {
  this.showAddEntryForm = !this.showAddEntryForm;
}

// Update the openEntryForm method
openEntryForm(attendance: Attendance): void {
  this.selectedAttendance = attendance;
  this.attendanceService.setSelectedDate(attendance.date);
  this.attendanceService.resetEntryForm();
  this.showAddEntryForm = false; // Initially don't show the form
  this.attendanceService.setShowEntryForm(true);
}

// Update the closeEntryForm method
closeEntryForm(): void {
  this.attendanceService.setShowEntryForm(false);
  this.selectedAttendance = null;
  this.showAddEntryForm = false;
}
}