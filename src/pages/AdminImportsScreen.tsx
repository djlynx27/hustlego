import { CsvImporter } from '@/components/CsvImporter';
import { UniversalFileAnalyzer } from '@/components/UniversalFileAnalyzer';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminImportsScreen() {
  return (
    <AdminPageShell
      title="Admin · Imports & documents"
      description="Zone d’ingestion des historiques. C’est ici que les erreurs de parsing ou de mapping peuvent fausser les scores et les revenus."
    >
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Utilisation prudente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>
            CSV Importer est préférable pour des historiques structurés, mais
            l’attribution de zone reste heuristique.
          </p>
          <p>
            Universal File Analyzer ne doit pas servir à créer des trips à
            partir d’un rapport global sans vérification humaine.
          </p>
          <p>
            Après chaque import, vérifie un petit échantillon avant de lancer
            des recalibrages IA.
          </p>
        </CardContent>
      </Card>

      <UniversalFileAnalyzer />
      <CsvImporter />
    </AdminPageShell>
  );
}
