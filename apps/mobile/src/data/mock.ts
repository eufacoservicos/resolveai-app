/** Dados de exemplo enquanto a camada Supabase não é ligada ao app. */
export interface Provider {
  id: string;
  initials: string;
  name: string;
  category: string;
  rating: string;
  reviews: number;
  distance: string;
  open: boolean;
  type: "individual" | "company";
  discount?: string;
}

export const nearbyProviders: Provider[] = [
  { id: "1", initials: "CS", name: "Carlos Silva", category: "Eletricista", rating: "4,9", reviews: 38, distance: "1,2 km", open: true, type: "individual", discount: "-15%" },
  { id: "2", initials: "AB", name: "Ana Beatriz", category: "Diarista", rating: "5,0", reviews: 72, distance: "2,8 km", open: true, type: "individual" },
  { id: "3", initials: "RB", name: "Refrigera BH", category: "Ar-condicionado", rating: "4,7", reviews: 24, distance: "3,5 km", open: false, type: "company" },
];

export const categories = [
  { slug: "eletricista", label: "Eletricista" },
  { slug: "diarista", label: "Diarista" },
  { slug: "encanador", label: "Encanador" },
  { slug: "pintor", label: "Pintor" },
  { slug: "pedreiro", label: "Pedreiro" },
];
