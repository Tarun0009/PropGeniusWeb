export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalLeads: number;
  hotLeads: number;
  conversionRate: number;
  listingsThisMonth: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface LeadFunnelData {
  status: string;
  count: number;
  percentage: number;
}
