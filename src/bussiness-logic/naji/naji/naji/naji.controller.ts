import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorator/role.decorator';
import { User } from 'src/auth/decorator/user.decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { NajiType } from 'src/utils/enums';
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { OrderMakerService } from 'src/walllet/wallet-services/order-maker.service';
import { WalletService } from 'src/walllet/wallet-services/wallet.service';
import {
  AggregateViolationReportWhitoutRegisterationDto,
  CreateUserNajiDto,
  NegeticvePoint,
  VerifyUserNajiDto,
  DriverNajiDto,
  palteIdAndViolationDto,
  palteIdDto,
  plateDto,
} from './dto/naji.dto';
import { NajiService } from './naji.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Controller('Services')
@ApiTags("Naji services Api's")
@Controller('naji')
export class NajiController {
  constructor(
    private najiService: NajiService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
  ) {}
  @Get('getToken')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getNajiToken(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.najiService.getNajiToken();
  }

  @Post('send-otp-when-is-login')
  // @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  sendOtpWhenUserisLogein( @User() user: any, @Body() dto: CreateUserNajiDto): Promise<INewResponseAPI<any>> {
    return this.najiService.sendOtpWhenUserisLogein(user,dto);
  }

  @Post('verify-otp-when-is-login')
  // @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  verifyUser( @User() user: any,@Body() dto: VerifyUserNajiDto): Promise<INewResponseAPI<any>> {
    return this.najiService.verifyOtpWhenUserisLogein(user,dto);
  }

  @Post('driver-license')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getDriverLicens(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.DRIVING_LICENSE,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.DRIVING_LICENSE);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.driverLicense(user, dto, order.id);
  }

  @Get('negetive-point')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getNegetivePoint(
    @User() user: any,
    @Body() dto: NegeticvePoint,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.NEGETIVE_POINT,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.NEGETIVE_POINT);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.negetivePoint(user, dto, order.id);
  }
  @Get('active-plates')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getUserActivePlate(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.ACTIVE_PLATES,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.ACTIVE_PLATES);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.activePlate(user, order.id, dto);
  }

  @Get('passport-status')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getPassportStatus(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.ACTIVE_PLATES,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.ACTIVE_PLATES);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.getPassportStatus(user, order.id, dto);
  }

  @Post('country-leaving-status')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getCountryLeavingStatus(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.COUNTRY_LEAVING,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.COUNTRY_LEAVING);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.getCountryLeavingStatus(user, order.id, dto);
  }

  @Post('violation-report')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getViolationReport(
    @User() user: any,
    @Body() dto: palteIdDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.VIOLATION_REPORT,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.VIOLATION_REPORT);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.getViolationReport(user, dto.plateId, order.id);
  }
  @Post('violation-image')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async violationImage(
    @User() user: any,
    @Body() dto: palteIdAndViolationDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.VIOLATION_IMAGE,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.VIOLATION_IMAGE);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.violationImage(
      user,
      dto.plateId,
      dto.violationId,
      order.id,
    );
  }
  @Post('violation-aggregate')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getAggregateViolationReport(
    @User() user: any,
    @Body() dto: palteIdDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.VIOLATION_AGGREGATE,
      user,
    );
    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(
        NajiType.VIOLATION_AGGREGATE,
      );
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.getAggregateViolationReport(
      user,
      dto.plateId,
      order.id,
    );
  }

  @Post('violation-aggregate-without-registeration')
  async getAggregateViolationReportWhitoutRegisteration(
    @Body() dto: AggregateViolationReportWhitoutRegisterationDto,
  ): Promise<INewResponseAPI<any>> {
    const { user, plate } = await this.najiService.registerUserAndPlate(dto);
    const order = await this.najiService.makeorder(
      {
        ...dto,
        plateId: plate.id,
      },
      NajiType.VIOLATION_AGGREGATE_NO_AUTH,
      user,
    );
    const price = this.najiService.getServicePrice(
      NajiType.VIOLATION_AGGREGATE_NO_AUTH,
    );
    const transaction = await this.najiService.createNajiTransaction(
      user.id,
      order.id,
      price,
    );
    return transaction;
  }

  @Post('document-status')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async documentStatus(
    @User() user: any,
    @Body() dto: palteIdDto,
  ): Promise<INewResponseAPI<any>> {
    const order = await this.najiService.makeorder(
      dto,
      NajiType.DOCUMENT_STATUS,
      user,
    );

    if (!dto.fromWallet) {
      const price = this.najiService.getServicePrice(NajiType.DOCUMENT_STATUS);
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.documentStatus(user, dto.plateId, order.id);
  }

  @Post('add-plate')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  addPlate(@User() user: any, dto: plateDto): Promise<INewResponseAPI<any>> {
    return this.najiService.addPlate(dto, dto.najiId);
  }
  @Delete('remove-plate')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  removePlate(
    @User() user: any,
    dto: VerifyUserNajiDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.removePlate(user, dto);
  }
  @Delete('plate-inquiry-result')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getPlateInquiryResult(
    @User() user: any,
    @Body() dto: palteIdDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.getPlatesInquiry(dto.plateId);
  }

  @Get('callback')
  callback(@Query() query: any) {
    return this.najiService.handleCallback(query);
  }
}
