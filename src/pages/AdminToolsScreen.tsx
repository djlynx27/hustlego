import { AdminPageShell } from '@/components/admin/AdminPageShell';
import {
  AdminManageCitiesCard,
  AdminSimulationCard,
} from '@/components/admin/AdminPanelCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminToolsScreen() {
  return (
    <AdminPageShell
      title="Admin · Outils & labo"
      description="Fonctions de support, de simulation et d’exploration. Elles ne doivent pas être confondues avec les vraies sources métier de l’app."
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Ce qui est expérimental ici
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>La simulation crée des scores synthétiques de test.</p>
          <p>
            Les outils qui n’influencent ni les zones, ni les revenus, ni le
            backend principal ont été retirés de cette page pour éviter de
            brouiller le workflow admin.
          </p>
        </CardContent>
      </Card>

      <AdminManageCitiesCard />
      <AdminSimulationCard />
    </AdminPageShell>
  );
}
