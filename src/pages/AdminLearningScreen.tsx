import { LearningInsightsPanel } from '@/components/LearningInsightsPanel';
import { WeightCalibratorPanel } from '@/components/WeightCalibratorPanel';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import {
  AdminAiAnalysisCard,
  AdminLearningAgentsCard,
} from '@/components/admin/AdminPanelCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLearningScreen() {
  return (
    <AdminPageShell
      title="Admin · Apprentissage IA"
      description="Modules qui apprennent à partir de tes trajets et recalculent les poids ou les scores. À utiliser seulement après ingestion de données propres."
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Routine recommandée
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>1. Importer ou logger des trips propres.</p>
          <p>2. Vérifier les rapports et les zones dominantes.</p>
          <p>3. Synchroniser l’apprentissage.</p>
          <p>4. Recalibrer les poids.</p>
          <p>5. Lancer ensuite seulement l’analyse IA des scores.</p>
        </CardContent>
      </Card>

      <LearningInsightsPanel />

      <div className="space-y-1">
        <h2 className="text-[18px] font-display font-bold px-1">
          Calibration IA
        </h2>
        <WeightCalibratorPanel />
      </div>

      <AdminAiAnalysisCard />
      <AdminLearningAgentsCard />
    </AdminPageShell>
  );
}
