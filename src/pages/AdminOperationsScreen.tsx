import { ModeTaxi } from '@/components/ModeTaxi';
import { ShiftTracker } from '@/components/ShiftTracker';
import { TripLogger } from '@/components/TripLogger';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOperationsScreen() {
  return (
    <AdminPageShell
      title="Admin · Opérations"
      description="Outils terrain pour enregistrer les courses, suivre les shifts et garder une trace des opérations quotidiennes."
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Ce qui nourrit vraiment l’app ici
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>
            Trip Logger écrit dans la table trips et reste la source manuelle la
            plus propre.
          </p>
          <p>
            Shift Tracker lit tes courses existantes, mais son $/h reste
            optimiste car il ne compte pas le temps mort entre les trajets.
          </p>
          <p>
            Mode Taxi reste local au navigateur et n’alimente pas encore le
            backend principal.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-1">
        <h2 className="text-[18px] font-display font-bold px-1">Mode taxi</h2>
        <ModeTaxi />
      </div>

      <ShiftTracker />
      <TripLogger />
    </AdminPageShell>
  );
}
