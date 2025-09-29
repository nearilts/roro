// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://cigading.krakatauport.id:8020',
  IMAGE_BASE_URL: 'https://cigading.krakatauport.id:8021',
  ENDPOINTS: {
    // RoRo API Endpoints
    CHECK_BOOKING: '/api/roro/check_booking_ticked_id',
    BOOKING_DETAIL: '/api/roro/booking_detail',
    BOOKING: '/api/roro/booking',
    LIST_SCHEDULE: '/api/roro/list_schedule',
    LIST_PORT_ORIGIN: '/api/roro/list_port_origin',
    LIST_PORT_DESTINATION: '/api/roro/list_port_destination',
    LIST_VEHICLE_CLASS: '/api/roro/list_vehicle_class',
    SAVE_ORDER: '/api/roro/save_order',
    SAVE_PASSENGER: '/api/roro/save_passenger',
    LIST_CITY: '/api/roro/list_city',
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export individual URLs for convenience
export const API_URLS = {
  CHECK_BOOKING: getApiUrl(API_CONFIG.ENDPOINTS.CHECK_BOOKING),
  BOOKING_DETAIL: (id) => getApiUrl(`${API_CONFIG.ENDPOINTS.BOOKING_DETAIL}/${id}`),
  BOOKING: getApiUrl(API_CONFIG.ENDPOINTS.BOOKING),
  LIST_SCHEDULE: getApiUrl(API_CONFIG.ENDPOINTS.LIST_SCHEDULE),
  LIST_PORT_ORIGIN: getApiUrl(API_CONFIG.ENDPOINTS.LIST_PORT_ORIGIN),
  LIST_PORT_DESTINATION: getApiUrl(API_CONFIG.ENDPOINTS.LIST_PORT_DESTINATION),
  LIST_VEHICLE_CLASS: getApiUrl(API_CONFIG.ENDPOINTS.LIST_VEHICLE_CLASS),
  SAVE_ORDER: getApiUrl(API_CONFIG.ENDPOINTS.SAVE_ORDER),
  SAVE_PASSENGER: getApiUrl(API_CONFIG.ENDPOINTS.SAVE_PASSENGER),
  LIST_CITY: getApiUrl(API_CONFIG.ENDPOINTS.LIST_CITY),
};

// Export image URLs
export const IMAGE_URLS = {
  LOGO: `${API_CONFIG.IMAGE_BASE_URL}/_nuxt/img/kipos-4x-removebg-preview.948721e.png`,
};

export default API_CONFIG;
