export const BUS_STATUSES = ["arrived", "leaving_soon", "departed"] as const;

export type BusStatus = (typeof BUS_STATUSES)[number];

export interface BusBayDisplay {
  id: string;
  bay: string;
  bus_number: string;
  operator_name: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  scheduled_arrival: string;
  scheduled_departure: string;
  status: BusStatus;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AD_MEDIA_TYPES = ["image", "gif", "video"] as const;
export type AdMediaType = (typeof AD_MEDIA_TYPES)[number];

export interface Advertisement {
  id: string;
  title: string;
  media_type: AdMediaType;
  storage_path: string;
  public_url: string;
  duration_seconds: number | null;
  /** Video only: play its full measured length (up to the 20s cap) instead of the default 5s slot. */
  play_full_duration: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABELS: Record<BusStatus, string> = {
  arrived: "Arrived",
  leaving_soon: "Leaving Soon",
  departed: "Departed",
};
