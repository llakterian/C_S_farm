export interface User {
  id: string;
  email: string;
  pin: string;
  farmType: 'tea' | 'dairy' | 'avocado' | 'mixed';
  location: string;
}

export interface Entity {
  id: string;
  type: 'crop' | 'livestock' | 'poultry';
  name: string;
  healthStatus: string;
  lastUpdated: Date;
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: Date;
}

export interface Report {
  id: string;
  type: 'yield' | 'expense' | 'payroll';
  data: Record<string, any>;
  generatedAt: Date;
}
