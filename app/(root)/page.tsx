import sampleData from '@/db/sample-data'
import { ProductList } from '@/components/shared/product/product-list'

export default function HomePage() {
  return <ProductList data={sampleData.products} title="Newest arrivals" limit={4} />
}
