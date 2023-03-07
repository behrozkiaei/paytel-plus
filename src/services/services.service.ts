import {
  ChargePayload,
  ChargePayloadForDb,
} from './../utils/interfaces/charge-payload.interface';
/* eslint-disable prettier/prettier */
import { INewResponseAPI } from 'src/utils/interfaces/response-type';
import { CACHE_MANAGER, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InternetProducts, internetPayloadForRequest } from 'src/utils/interfaces/internet-products-model';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { chargeDto } from 'src/walllet/dto/internet.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment-jalaali');
@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getInternetPackages() {
    try {
      const now = moment().format('jYYYY/jMM/jDD HH:mm:ss');
      //check db for packages
      const internet = await this.cacheManager.get('internet');
      if (typeof internet === 'undefined') {
        // if not request to get packages
        const response = await this.requestToServiceProvider('products');
        if (response.code == '1') {
          const products = response.products.internet;
          await this.prisma.internetProduct.deleteMany({});
          const productsToInsert= products?.map((pro) => {
            pro.product_id = pro.id;
            delete pro.id;
            pro.date = moment().format('jYYYY/jMM/jDD HH:mm:ss');
            return pro;
          });
          // console.log(productsToInsert);
          await this.prisma.internetProduct.createMany({
            data : productsToInsert
          });
          const productsToSend= products?.map((pro) => {
            pro.valueOperator = pro.operator;
            return pro;
          });
          const group = this.groupBy(productsToSend, 'internet_type');
          const finalGroup = [];

          Object.keys(group).forEach(function(key) {
            
            let keyPersion  
            if(key  == "hourly") {
              keyPersion = "ساعتی";
            }else 
            if(key  == "daily") {
              keyPersion = "روزانه";
            }else
            if(key  == "weekly") {
              keyPersion = "هفتگی";
            }else
            if(key  == "monthly") {
              keyPersion = "یکماهه";
            }else
            if(key  == "yearly") {
              keyPersion = "سالیانه";
            }else
            if(key  == "amazing") {
              keyPersion = "شگفتانه";
            }else
            if(key  == "other") {
              keyPersion = "سایر";
            }else{
              keyPersion = "نامشخص";
            } 
            if(key != "hourly"){
              
              finalGroup.push({key:keyPersion,value: group[key]})
            }
            // console.log('Key : ' + this.translate(key) + ', Value : ' + group[key])
          })
          // console.log(products);
          //insert new packages in the db
          await this.cacheManager.set(
            'internet',
            JSON.stringify(finalGroup),
            6 * 60 * 60*1000,
          );
        }
        // await this.prisma.internetProduct.createMany({ data: products });
      }
      let data: string = await this.cacheManager.get('internet');
      data = JSON.parse(data);
      // const group = this.groupBy(products, 'internet_type');
      return {
        result: data,
        status: true,
      };
      // const internetProducts = await this.prisma.internetProduct.findMany({});

      //return packages
    } catch (e) {
      console.log(e);
      return {
        status: false,
        result: null,
        message: e.message ?? 'خطا در برقراری سرویس',
      };
    }
  }
  async requestToServiceProvider(
    method: string,
    payload: any = {},
  ): Promise<any> {
    const data = JSON.stringify({
      username: 'f7b126d28d271b425980e8caccad7cdc',
      password: '5924a1212XYZ',
      method: method,
      ...payload
    });
    console.log(payload);
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://inax.ir/webservice.php',
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };
    try {
      const response = await axios(config);
      if (response.status == 200) {
        return response.data;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);

      return false;
    }
  }
  groupBy = (items, key) =>
    items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {},
    );

  async buyInternet(orderId): Promise<INewResponseAPI<any>> {
    const order =await this.prisma.order.findUnique({where:{id:orderId}});
    // first save order and payload  base on wallet or credit
    const data :InternetProducts = JSON.parse(order.payload);
    const  payload :internetPayloadForRequest= {
      product_id: data.product_id,
      amount: data.amount,
      operator: data.operator,
      sim_type: data.sim_type,
      internet_type: data.internet_type,
      order_id: data.order_id,
      mobile :data.mobile
    }; 
    try{
      const res = await this.requestToServiceProvider('internet', {...payload});
      if (res.code == '1') {
        return {
          status: true,
          result :{
            ...res
          }
        };
      }else{
        throw Error(res.msg??"درخواست با خطا مواجه شد")
      }
    }catch(e){
      console.log(e)
      return   {
        status: true,
        message: e.message ?? "مشکل در برقراری سرویس"
      }
    }
  }

  async buyCharge(orderId): Promise<INewResponseAPI<any>> {
    const order =await this.prisma.order.findUnique({where:{id:orderId}});

    // first save order and payload  base on wallet or credit
    const  dto :ChargePayloadForDb = JSON.parse(order.payload); 
    const payload  = {
      operator:dto.operator,
      amount: ((+dto.amount)/10).toString(),
      mobile: dto.mobile,
      charge_type: dto.charge_type ?? "normal",
      order_id: dto.order_id,
    }
    console.log(payload)
    try{
      const res = await this.requestToServiceProvider('topup', {...payload});
      console.log(res);
      if (res.code == '1' || res.code == 1) {
        return {
          status: true,
          result :{
            ...res
          }
        };
      }else{
        throw Error(res.msg ?? "درخواست با خطا مواجه شد")
      }
    }catch(e){
      console.log(e)
      return   {
        status: false,
        message: e.message ?? "مشکل در برقراری سرویس"
      }
    }
  }

  translate( key ):string{
    console.log(key)
    switch(key){
      case "hourly":
        return "ساعتی";
      case  "daily":
        return "روزانه"; 
      case "weekly":
        return "هفتگی"; 
      case "monthly":
        return "یکماهه";
      case "yearly":
        return "سالیانه"; 
      case  "amazing":
        return "شگفت انگیز";
      case  "other":
        return "سایر";  
      return "نامشخص";
      break;
    }
  }
}
