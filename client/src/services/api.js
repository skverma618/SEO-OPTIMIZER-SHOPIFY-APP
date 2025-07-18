const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth methods
  async generateAuthUrl(shop) {
    return this.request(`/api/auth/install?shop=${encodeURIComponent(shop)}`, {
      method: 'POST',
    });
  }

  async verifyShopSession(shop) {
    return this.request(`/api/auth/verify?shop=${encodeURIComponent(shop)}`, {
      method: 'GET',
    });
  }

  // Products methods
  async getProducts(shop, { page = 1, limit = 10, search = '' } = {}) {
    const params = new URLSearchParams({
      shop,
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    return this.request(`/api/products?${params}`);
  }

  async getProductById(shop, productId) {
    return this.request(`/api/products/${productId}?shop=${encodeURIComponent(shop)}`);
  }

  // SEO methods
  async analyzeSEO(shop, productIds) {
    return this.request(`/api/seo/analyze?shop=${encodeURIComponent(shop)}`, {
      method: 'POST',
      body: JSON.stringify({
        productIds,
      }),
    });
  }

  async applySEO(shop, suggestions) {
    return this.request(`/api/seo/apply/bulk?shop=${encodeURIComponent(shop)}`, {
      method: 'POST',
      body: JSON.stringify({
        suggestions,
      }),
    });
  }

  async applySEONew(shop, products) {
    return this.request(`/api/seo/apply/bulk-new?shop=${encodeURIComponent(shop)}`, {
      method: 'POST',
      body: JSON.stringify({
        products,
      }),
    });
  }

  async getScanHistory(shop, { page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({
      shop,
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request(`/api/seo/history?${params}`);
  }

  // Brand Story methods
  async getBrandStory(shop) {
    return this.request(`/api/auth/brand-story?shop=${encodeURIComponent(shop)}`);
  }

  async saveBrandStory(shop, brandStoryData) {
    return this.request(`/api/auth/brand-story?shop=${encodeURIComponent(shop)}`, {
      method: 'POST',
      body: JSON.stringify(brandStoryData),
    });
  }
}

export default new ApiService();