import { Module } from './types.ts';

export const INITIAL_MODULES: Module[] = [
  {
    id: 100,
    title: "CHAPITRE 1 : Les Fondamentaux",
    lessons: [
      {
        id: 1,
        moduleId: 100,
        title: "Bienvenue & Posture",
        subtitle: "Les bases pour ne pas avoir mal au dos",
        duration: "10 min",
        status: 'active',
        type: 'standard',
        content: {
          heading: "Tenir sa guitare correctement",
          description: "Dans cette première leçon, nous allons apprendre à tenir l'instrument sans créer de tensions. C'est le secret pour jouer longtemps avec plaisir.",
          tips: [
            "Gardez le dos droit, ne vous penchez pas sur la guitare.",
            "La tête du manche doit être légèrement surélevée.",
            "Respirez calmement par le ventre."
          ]
        }
      },
      {
        id: 2,
        moduleId: 100,
        title: "Accorder sa Guitare",
        subtitle: "L'étape indispensable avant de jouer",
        duration: "15 min",
        status: 'locked',
        type: 'standard',
        content: {
          heading: "L'accordage standard (E A D G B E)",
          description: "Une guitare bien accordée est essentielle. Nous allons utiliser un accordeur électronique pour régler chaque corde une par une.",
          tips: [
            "Commencez toujours par la corde la plus grave (le gros Mi).",
            "Tournez la clé doucement, n'allez pas trop vite.",
            "Si l'aiguille est au centre (ou verte), c'est parfait !"
          ]
        }
      }
    ]
  },
  {
    id: 200,
    title: "CHAPITRE 2 : Premiers Pas",
    lessons: [
      {
        id: 3,
        moduleId: 200,
        title: "Premier Accord (Mi Mineur)",
        subtitle: "Votre tout premier son de guitare",
        duration: "20 min",
        status: 'locked',
        type: 'practice', // Validation requise
        validationStatus: 'none',
        content: {
          heading: "L'accord de Mi Mineur (Em)",
          description: "C'est l'accord le plus simple et le plus beau pour commencer. Il ne nécessite que deux doigts ! Pour valider ce module, vous devrez m'envoyer une courte vidéo.",
          tips: [
            "Utilisez l'index et le majeur.",
            "Appuyez fermement avec le bout des doigts, pas le plat.",
            "Grattez toutes les cordes d'un coup franc."
          ]
        }
      },
      {
        id: 4,
        moduleId: 200,
        title: "Rythmique de Base",
        subtitle: "Apprendre à battre la mesure",
        duration: "25 min",
        status: 'locked',
        type: 'standard',
        content: {
          heading: "Le mouvement de balancier",
          description: "La main droite donne le rythme. Nous allons apprendre le mouvement 'Bas - Bas - Haut - Bas'.",
          tips: [
            "Restez souple du poignet.",
            "Ne bloquez pas votre respiration.",
            "Comptez à voix haute : 1, 2, 3, 4."
          ]
        }
      }
    ]
  },
  {
    id: 300,
    title: "CHAPITRE 3 : Mélodies",
    lessons: [
      {
        id: 5,
        moduleId: 300,
        title: "Mélodie Simple",
        subtitle: "Jouer 'Jeux Interdits' (Début)",
        duration: "30 min",
        status: 'locked',
        type: 'standard',
        content: {
          heading: "Introduction à la mélodie",
          description: "Nous allons jouer les premières notes de cette mélodie célèbre. Prenez votre temps pour bien détacher chaque note.",
          tips: [
            "Laissez résonner les cordes à vide.",
            "Soyez patient, la vitesse viendra plus tard.",
            "Félicitez-vous pour chaque progrès !"
          ]
        }
      }
    ]
  }
];