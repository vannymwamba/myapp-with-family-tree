import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          familyTreeTitle: "{{name}} Family Tree",
          searchPlaceholder: "Search family members...",
          resetView: "Reset View",
          exportPDF: "Export to PDF",
          familyStats: "Family Statistics",
          totalMembers: "Total Members",
          generations: "Generations",
          averageWealth: "Average Wealth",
          noResults: "No results found"
        }
      },
      es: {
        translation: {
          familyTreeTitle: "Árbol Genealógico de {{name}}",
          searchPlaceholder: "Buscar miembros de la familia...",
          resetView: "Reiniciar Vista",
          exportPDF: "Exportar a PDF",
          familyStats: "Estadísticas Familiares",
          totalMembers: "Miembros Totales",
          generations: "Generaciones",
          averageWealth: "Riqueza Promedio",
          noResults: "No se encontraron resultados"
        }
      },
      fr: {
        translation: {
          familyTreeTitle: "Arbre Généalogique {{name}}",
          searchPlaceholder: "Rechercher des membres de la famille...",
          resetView: "Réinitialiser la Vue",
          exportPDF: "Exporter en PDF",
          familyStats: "Statistiques Familiales",
          totalMembers: "Nombre Total de Membres",
          generations: "Générations",
          averageWealth: "Richesse Moyenne",
          noResults: "Aucun résultat trouvé"
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;