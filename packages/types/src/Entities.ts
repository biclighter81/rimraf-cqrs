

////////Article

export interface Article {
  articleId: string
  name: string
  price: number
}

export interface ArticleEvents {
  ArticledBuilded: { articleId: string, name: string }
  ReadyForSale: { articleId: string, price: number }
  PriceIncreased: { articleId: string, newPrice: number }
  OutOfOrder: { articleId: string }

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