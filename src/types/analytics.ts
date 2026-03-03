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

export interface PipelineValue {
  status: string;
  label: string;
  count: number;
  totalValue: number;
}

export interface SourceROI {
  source: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface ListingPerformance {
  avgDaysOnMarket: number;
  avgViewsPerListing: number;
  avgInquiriesPerListing: number;
  totalViews: number;
  totalInquiries: number;
}
