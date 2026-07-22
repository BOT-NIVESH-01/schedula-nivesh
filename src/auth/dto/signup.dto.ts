import { Role } from '../../common/enums/role.enum';

export class SignupDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  role!: Role;
}