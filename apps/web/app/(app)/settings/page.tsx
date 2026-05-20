import { ComingSoon } from '@/components/ui/ComingSoon';
export default function Page() {
  return <ComingSoon title="Paramètres" description="Configuration générale du SIRH, types de congés, départements." available={['/companies', '/rgpd']} />;
}
