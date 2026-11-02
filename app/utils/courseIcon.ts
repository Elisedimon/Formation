export type CourseIconName = "code" | "marketing" | "excel" | "data" | "projet" | "idee" | "diplome";

export const ICONS: Record<CourseIconName, string> = {
  code: `<polyline points="8,7 3,12 8,17"/><polyline points="16,7 21,12 16,17"/><line x1="14" y1="5" x2="10" y2="19"/>`,
  marketing: `<polyline points="3,10 7,10 15,5 15,19 7,14 3,14 3,10"/><line x1="7" y1="14" x2="8.5" y2="19.5"/><line x1="18" y1="9.5" x2="21" y2="8.5"/><line x1="18" y1="12" x2="21" y2="12"/><line x1="18" y1="14.5" x2="21" y2="15.5"/>`,
  excel: `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="4" x2="9" y2="20"/>`,
  data: `<rect x="4" y="13" width="4" height="7" rx="1"/><rect x="10" y="8" width="4" height="12" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/><line x1="3" y1="21.5" x2="21" y2="21.5"/>`,
  projet: `<rect x="3" y="4" width="5" height="16" rx="1.2"/><rect x="9.5" y="4" width="5" height="10" rx="1.2"/><rect x="16" y="4" width="5" height="13" rx="1.2"/>`,
  idee: `<circle cx="12" cy="10" r="5.5"/><line x1="9.5" y1="17.5" x2="14.5" y2="17.5"/><line x1="10" y1="20.5" x2="14" y2="20.5"/>`,
  diplome: `<polyline points="12,4 22,9 12,14 2,9 12,4"/><polyline points="6,11.5 6,16 12,19 18,16 18,11.5"/><line x1="22" y1="9" x2="22" y2="15"/>`
};

const RULES: [CourseIconName, string[]][] = [
  ["code", ["react", "web", "dev", "program", "code", "nuxt", "javascript", "python", "html", "mobile", "informatique"]],
  ["marketing", ["marketing", "seo", "publicit", "reseaux sociaux", "communication", "vente"]],
  ["excel", ["excel", "tableur"]],
  ["data", ["data", "donnee", "power bi", "analyse", "statistique", "intelligence"]],
  ["projet", ["projet", "agile", "scrum", "management", "gestion"]],
  ["idee", ["entrepreneur", "business", "startup", "innovation", "creativ"]]
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function pickCourseIcon(title: string, explicit?: string | null): CourseIconName {
  if (explicit && Object.prototype.hasOwnProperty.call(ICONS, explicit)) return explicit as CourseIconName;
  const t = norm(title);
  for (const [name, words] of RULES) if (words.some((w) => t.includes(w))) return name;
  return "diplome";
}