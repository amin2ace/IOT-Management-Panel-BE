export interface IUser {
  userId: string; // UUID v4
  userName: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
