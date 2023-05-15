import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { NajiType, OrderType } from 'src/utils/enums';
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
  NationalCodeDto,
  MobileDto,
  MobileAndNationalDto,
} from './dto/naji.dto';
import { NajiService } from './naji.service';

@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags("Naji services Api's")
@Controller('naji')
export class NajiController {
  constructor(
    private najiService: NajiService,
    private walletService: WalletService,
    private orderMaker: OrderMakerService,
  ) {}

  @Post('send-otp-when-is-login')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  sendOtpWhenUserisLogein(
    @User() user: any,
    @Body() dto: CreateUserNajiDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.sendOtpWhenUserisLogein(user, dto);
  }

  @Post('verify-otp-when-is-login')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  verifyUser(
    @User() user: any,
    @Body() dto: VerifyUserNajiDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.verifyOtpWhenUserisLogein(user, dto);
  }

  @Post('driver-license')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getDriverLicens(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const price = this.najiService.getServicePrice(NajiType.DRIVING_LICENSE);
    const order = await this.najiService.makeorder(
      {...dto,price},
     dto.fromWallet ? OrderType.DRIVING_LICENSE_BY_WALLET :OrderType.DRIVING_LICENSE_BY_CREDIT,
      user,
    );

    if (!dto.fromWallet) {
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.driverLicense(user, dto, order.id);
  }

  @Post('negetive-point')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getNegetivePoint(
    @User() user: any,
    @Body() dto: NegeticvePoint,
  ): Promise<INewResponseAPI<any>> {
    const price = this.najiService.getServicePrice(NajiType.NEGETIVE_POINT);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.NEGETIVE_POINT_BY_WALLET :OrderType.NEGETIVE_POINT_BY_CREDIT,
      user,
    );

    if (!dto.fromWallet) {
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.negetivePoint(user, dto, order.id);
  }
  @Post('active-plates')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getUserActivePlate(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const price = this.najiService.getServicePrice(NajiType.ACTIVE_PLATES);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.ACTIVE_PLATES_BY_WALLET :OrderType.ACTIVE_PLATES_BY_CREDIT,
      user,
    );

    if (!dto.fromWallet) {
      const transaction = await this.najiService.createNajiTransaction(
        user.id,
        order.id,
        price,
      );
      return transaction;
    }
    return this.najiService.activePlate(user, order.id, dto);
  }

  @Post('passport-status')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getPassportStatus(
    @User() user: any,
    @Body() dto: DriverNajiDto,
  ): Promise<INewResponseAPI<any>> {
    const price = this.najiService.getServicePrice(NajiType.ACTIVE_PLATES);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.PASSPORT_STATUS_BY_WALLET :OrderType.PASSPORT_STATUS_BY_CREDIT,
      user,
    );

    if (!dto.fromWallet) {
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
    const price = this.najiService.getServicePrice(NajiType.COUNTRY_LEAVING);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.COUNTRY_LEAVING_BY_WALLET :OrderType.COUNTRY_LEAVING_BY_CREDIT,
      user,
    );

    if (!dto.fromWallet) {
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
    console.log(dto)
    try{
      const price = this.najiService.getServicePrice(NajiType.VIOLATION_REPORT);
      const payload ={
        ...dto,
        price : price
      }
      const order = await this.najiService.makeorder(
        payload,
        dto.fromWallet ? OrderType.VIOLATION_REPORT_BY_WALLET : OrderType.VIOLATION_REPORT_BY_CREDIT  ,
        user,
      );
      console.log(order)
      if (!dto.fromWallet) {
        const transaction = await this.najiService.createNajiTransaction(
          user.id,
          order.id,
          price,
        );
        return transaction;
      }
      return this.najiService.getViolationReport(user, dto.plateId, order.id);
    }catch(e){
      console.log(e)
      return{
        status:false
      }
    }
  }
  @Post('violation-image')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async violationImage(
    @User() user: any,
    @Body() dto: palteIdAndViolationDto,
  ): Promise<INewResponseAPI<any>> {
    const price = this.najiService.getServicePrice(NajiType.VIOLATION_IMAGE);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.VIOLATION_IMAGE_BY_WALLET : OrderType.VIOLATION_IMAGE_BY_CREDIT  ,
      user,
    );

    if (!dto.fromWallet) {
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
    const price = this.najiService.getServicePrice(
      NajiType.VIOLATION_AGGREGATE,
    );
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.VIOLATION_AGGREGATE_BY_WALLET : OrderType.VIOLATION_AGGREGATE_BY_CREDIT  ,
      user,
    );
    if (!dto.fromWallet) {
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
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  async getAggregateViolationReportWhitoutRegisteration(
    @Body() dto: AggregateViolationReportWhitoutRegisterationDto,
  ): Promise<INewResponseAPI<any>> {
    const { user, plate } = await this.najiService.registerUserAndPlate(dto);
    const price = this.najiService.getServicePrice(
      NajiType.VIOLATION_AGGREGATE_NO_AUTH,
    );
    const order = await this.najiService.makeorder(
      {
        ...dto,
        plateId: plate.id,
        price
      },
      OrderType.VIOLATION_AGGREGATE_NO_AUTH_BY_CREDIT ,
      user,
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
    const price = this.najiService.getServicePrice(NajiType.DOCUMENT_STATUS);
    const order = await this.najiService.makeorder(
      {...dto,price},
      dto.fromWallet ? OrderType.DOCUMENT_STATUS_BY_WALLET : OrderType.DOCUMENT_STATUS_BY_CREDIT  ,      user,
    );

    if (!dto.fromWallet) {
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
  addPlate(
    @User() user: any,
    @Body() dto: plateDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.addPlate(dto, dto.najiId);
  }
  @Get('plates')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getPlates(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.najiService.getPlates(user);
  }
  @Get('my-naji-users')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getMyNajiUsers(@User() user: any): Promise<INewResponseAPI<any>> {
    return this.najiService.getMyNajiUser(user);
  }
  @Post('my-naji-user-by-national-code')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getMyNajiUserByNationalCode(
    @User() user: any,
    @Body() dto: NationalCodeDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.myNajiUsersByNationalCode(user, dto);
  }

  @Post('my-naji-user-by-mobile')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getMyNajiUserByMobile(
    @User() user: any,
    @Body() dto: MobileDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.myNajiUsersByMobile(user, dto);
  }

  @Post('my-naji-user-by-mobile-and-national')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getMyNajiUserByMobileAndNational(
    @User() user: any,
    @Body() dto: MobileAndNationalDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.myNajiUsersByMobileAndNAtional(user, dto);
  }

  @Delete('remove-plate/:id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  removePlate(
    @User() user: any,
    @Param('id') id: string,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.removePlate(user, id);
  }
  @Post('plate-inquiry-result')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getPlateInquiryResult(
    @User() user: any,
    @Body() dto: palteIdDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.getPlatesInquiry(dto.plateId);
  }
  @Post('plate-by-info')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getPlateByInfo(
    @User() user: any,
    @Body() dto: plateDto,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.getPlateByInfo(user, dto);
  }
  @Get('my-inquiry-result')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getAllInquiry(
    @User() user: any,
    @Param('page') page?: string,
    @Param('size') size?: string,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.getAllInquiryRes(user, page, size);
  }
  @Get('my-inquiry-result-by-id')
  @Roles(Role.ADMIN, Role.LEVEL1, Role.LEVEL2)
  getInquiryById(
    @User() user: any,
    @Param('id') id?: string,
  ): Promise<INewResponseAPI<any>> {
    return this.najiService.getInquiryByIdRes(user, id);
  }
 
}
