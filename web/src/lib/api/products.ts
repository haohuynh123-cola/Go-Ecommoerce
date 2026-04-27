import apiClient from './client';
import type {
  ApiSuccess,
  ApiPaginated,
  Product,
  ProductFilters,
  CreateProductPayload,
  UpdateProductPayload,
} from './types';

export async function listProducts(filters: ProductFilters = {}): Promise<{
  data: Product[];
  pagination: ApiPaginated<Product>['pagination'];
}> {
  const params: Record<string, string | number> = {};
  if (filters.name) params.name = filters.name;
  if (filters.sku) params.sku = filters.sku;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.page_size !== undefined) params.page_size = filters.page_size;

  const res = await apiClient.get<ApiPaginated<Product>>('/products/', { params });
  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
}

export async function getProduct(id: number): Promise<Product> {
  const res = await apiClient.get<ApiSuccess<Product>>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await apiClient.post<ApiSuccess<Product>>('/products/', payload);
  return res.data.data;
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  const res = await apiClient.put<ApiSuccess<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
