import { SetMetadata } from '@nestjs/common';

export const CanTransaction = () => SetMetadata("checkCanTransaction", true);

