export interface InternetProducts {
  id?: string;
  product_id?: string;
  name?: string;
  amount?: string;
  amount_rial?: string;
  operator?: string;
  internet_type?: string;
  days?: string;
  volume?: string;
  unit?: string;
  course?: string;
  course_range?: string;
  date?: string;
  sim_type?: string;
  order_id?: string;
  mobile?: string;
}

export interface internetPayloadForRequest {
  product_id: string;
  amount: string;
  operator: string;
  sim_type: string;
  internet_type: string;
  order_id: string;
  mobile: string;
}
