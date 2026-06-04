export type CoupleStatus = 'pending' | 'active';
export type RouteVisibility = 'public' | 'couple_only' | 'deleted';

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  invite_code: string;
  user1_id: string;
  user2_id: string | null;
  status: CoupleStatus;
  created_at: string;
  connected_at: string | null;
};

export type Region = {
  id: string;
  name: string;
  sort_order: number;
};

export type Station = {
  id: string;
  region_id: string;
  name: string;
  line_name: string | null;
  sort_order: number;
};

export type Theme = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Route = {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description: string;
  region_id: string | null;
  station_id: string | null;
  visibility: RouteVisibility;
  view_count: number;
  like_count: number;
  popularity_score: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RouteStop = {
  id: string;
  route_id: string;
  sort_order: number;
  place_name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photo_path: string | null;
  rating: number | null;
  created_at: string;
};

export type UserTier = 'guest' | 'member' | 'couple';
