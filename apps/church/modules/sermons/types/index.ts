export interface Sermon {
  id: string;
  churchId: string;
  title: string;
  pastorId: string;
  series: string | null;
  scripture: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  preachedAt: string;
  createdAt: string;
  createdBy: string;
  pastor?: { name: string };
}
