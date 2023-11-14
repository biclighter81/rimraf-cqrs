

////////Article

export interface Article {
  articleId: string
  name: string
  price: number

  active:boolean
  manufacturerId: string
}

export interface ArticleEvents {
  ArticledBuilded: { articleId: string, name: string }
  ReadyForSale: { articleId: string, price: number }
  PriceIncreased: { articleId: string, newPrice: number }
  OutOfOrder: { articleId: string }
  NameChanged: {articleId: string, name: string}

  ManufacturerAssigned: {articleId: string, manufactor: Manufactor}
}

export interface ManufactorEvents{
  CreateManufactor: {manufactorId: string, name: string}
  NameChanged: {manufactorId: string, name: string}
}


export interface Manufactor{
  manufactorId: string;
  name: string;
}
///Order
export interface Order {
  orderId: string;
  customerName: string;
  orderDate: Date;
  shippedDate: Date;

  articles: OrderPosition[]

}

export interface OrderPosition {
  articleId: number,
  amount: number,
  orderPrice: number
}

export interface OrderEvents {
  OrderStarted: { orderId: string, customer: string }
  PositionAdded: { orderId: string, articleId: string, amount: number, orderPrice: number }
  AmountChanged: { orderId: string, articleId: string, amount: number }
  PositionRemoved: { orderId: string, articleId: string }
  Ordered: { orderId: string, orderDate: number }
  Shipped: { orderId: string, shippedDate: number }
}