import { ComingSoon } from '@/components/ui/ComingSoon';
export default function Page() {
  return <ComingSoon title="Organigramme" description="Vue hiérarchique du groupe." available={['/employees']} />;
}
