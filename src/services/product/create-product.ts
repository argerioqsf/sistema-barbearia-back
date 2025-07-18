import { ProductRepository } from '@/repositories/product-repository'
import { Product } from '@prisma/client'

interface CreateProductRequest {
  name: string
  description?: string | null
  imageUrl?: string | null
  quantity?: number
  cost: number
  price: number
  unitId: string
}

interface CreateProductResponse {
  product: Product
}

export class CreateProductService {
  constructor(private repository: ProductRepository) {}

  async execute(data: CreateProductRequest): Promise<CreateProductResponse> {
    const product = await this.repository.create({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      quantity: data.quantity ?? 0,
      cost: data.cost,
      price: data.price,
      unit: { connect: { id: data.unitId } },
    })
    return { product }
  }
}
