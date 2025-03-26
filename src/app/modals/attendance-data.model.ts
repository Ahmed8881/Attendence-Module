export interface Attendance {
    date: Date;
    firstIn: string | null;
    lastOut: string | null;
    totalHours: string | null;
    payableHours: string | null;
    overtime: string | null;
    status: 'Present' | 'Absent' | 'Weekend' | null;
    shift: string;
    regularization: string | null;
    notes?: string;
  }
  
  export interface DateRange {
    start: Date;
    end: Date;
  }
  
  export type ViewType = 'list' | 'table' | 'calendar';
  
  export interface Employee {
    id: string;
    name: string;
    avatar: string;
    shift: string;
  }
  
  export interface EntryForm {
    checkInTime: string;
    checkInTimeType: string;
    checkOutTime: string;
    checkOutTimeType: string;
    checkInNotes: string;
    checkOutNotes: string;
  }