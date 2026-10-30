import PageTransition from "@/components/PageTransition";

// Remounts on every navigation, so each new page gets its entrance.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
