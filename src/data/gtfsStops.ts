// Généré par `tsx src/scripts/processGtfsStatic.ts` depuis les archives
// GTFS statiques exo/RTL dans D:/Documents/Transport Dataset. Ne pas éditer à la main —
// re-lancer le script pour rafraîchir. 81 gares/terminus
// majeurs, 38 mappés à une zone (seuil
// 2000m), 43 hors territoire.
// Agences traitées: CITCRC, CITLA, LRRS, MRCLM, TRAINS.
// [À VÉRIFIER] agences ciblées absentes du dataset: RTL.
export type GtfsStop = {
  stopId: string
  name: string
  agencyId: string
  latitude: number
  longitude: number
  zoneId: string | null
  cityId: string | null
  distanceToZoneM: number | null
}

export const GTFS_STOPS: readonly GtfsStop[] = [
  {
    "stopId": "80015",
    "name": "Terminus Le Carrefour",
    "agencyId": "CITLA",
    "latitude": 45.568664,
    "longitude": -73.747571,
    "zoneId": "lvl-cl",
    "cityId": "lvl",
    "distanceToZoneM": 378
  },
  {
    "stopId": "80310",
    "name": "Terminus Saint-Jérôme",
    "agencyId": "CITLA",
    "latitude": 45.77345276923076,
    "longitude": -73.99944653846154,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 12022
  },
  {
    "stopId": "81831",
    "name": "Gare Rosemère",
    "agencyId": "CITLA",
    "latitude": 45.633487,
    "longitude": -73.7952645,
    "zoneId": "rsm-gr",
    "cityId": "rsm",
    "distanceToZoneM": 130
  },
  {
    "stopId": "82097",
    "name": "Terminus Montmorency",
    "agencyId": "CITLA",
    "latitude": 45.55832766666666,
    "longitude": -73.72052466666666,
    "zoneId": "lvl-mm",
    "cityId": "lvl",
    "distanceToZoneM": 77
  },
  {
    "stopId": "82126",
    "name": "Terminus Cartier",
    "agencyId": "CITLA",
    "latitude": 45.559588,
    "longitude": -73.682191,
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "distanceToZoneM": 78
  },
  {
    "stopId": "83720",
    "name": "Terminus Sainte-Thérèse",
    "agencyId": "CITLA",
    "latitude": 45.6357645,
    "longitude": -73.83505591666666,
    "zoneId": "sth-gs",
    "cityId": "sth",
    "distanceToZoneM": 77
  },
  {
    "stopId": "85156",
    "name": "Terminus Terrebonne",
    "agencyId": "CITLA",
    "latitude": 45.6979,
    "longitude": -73.653368,
    "zoneId": "trb-cl",
    "cityId": "trb",
    "distanceToZoneM": 753
  },
  {
    "stopId": "75030",
    "name": "Terminus Longueuil",
    "agencyId": "LRRS",
    "latitude": 45.523619,
    "longitude": -73.522247,
    "zoneId": "lng-tl",
    "cityId": "lng",
    "distanceToZoneM": 96
  },
  {
    "stopId": "75257",
    "name": "Gare Candiac",
    "agencyId": "LRRS",
    "latitude": 45.360823,
    "longitude": -73.514487,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 6363
  },
  {
    "stopId": "75640",
    "name": "Terminus Montcalm-Candiac",
    "agencyId": "LRRS",
    "latitude": 45.393495,
    "longitude": -73.5163638,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2944
  },
  {
    "stopId": "75648",
    "name": "Terminus La Prairie",
    "agencyId": "LRRS",
    "latitude": 45.42596574999999,
    "longitude": -73.4805725,
    "zoneId": "lap-c",
    "cityId": "lng",
    "distanceToZoneM": 1750
  },
  {
    "stopId": "75658",
    "name": "Terminus Panama",
    "agencyId": "LRRS",
    "latitude": 45.466509333333335,
    "longitude": -73.46853633333332,
    "zoneId": "lng-mc",
    "cityId": "lng",
    "distanceToZoneM": 631
  },
  {
    "stopId": "75876",
    "name": "Terminus Brossard",
    "agencyId": "LRRS",
    "latitude": 45.43709174999999,
    "longitude": -73.4327775,
    "zoneId": "lng-rem",
    "cityId": "lng",
    "distanceToZoneM": 202
  },
  {
    "stopId": "76047",
    "name": "Terminus Georges-Gagné",
    "agencyId": "LRRS",
    "latitude": 45.384487500000006,
    "longitude": -73.54796516666666,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 5262
  },
  {
    "stopId": "76085",
    "name": "Gare Sainte-Catherine",
    "agencyId": "LRRS",
    "latitude": 45.382097,
    "longitude": -73.600065,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 7112
  },
  {
    "stopId": "76149",
    "name": "Terminus Angrignon",
    "agencyId": "LRRS",
    "latitude": 45.446563,
    "longitude": -73.605266,
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "distanceToZoneM": 117
  },
  {
    "stopId": "76401",
    "name": "Gare Saint-Constant",
    "agencyId": "LRRS",
    "latitude": 45.37415,
    "longitude": -73.570744,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 7354
  },
  {
    "stopId": "82126",
    "name": "Terminus Cartier",
    "agencyId": "MRCLM",
    "latitude": 45.559588,
    "longitude": -73.682191,
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "distanceToZoneM": 78
  },
  {
    "stopId": "83724",
    "name": "Terminus Sainte-Thérèse",
    "agencyId": "MRCLM",
    "latitude": 45.6357855,
    "longitude": -73.834545,
    "zoneId": "sth-gs",
    "cityId": "sth",
    "distanceToZoneM": 40
  },
  {
    "stopId": "84000",
    "name": "Terminus Montmorency",
    "agencyId": "MRCLM",
    "latitude": 45.558611,
    "longitude": -73.720174,
    "zoneId": "lvl-mm",
    "cityId": "lvl",
    "distanceToZoneM": 109
  },
  {
    "stopId": "84656",
    "name": "Terminus Henri-Bourassa",
    "agencyId": "MRCLM",
    "latitude": 45.554209,
    "longitude": -73.667896,
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "distanceToZoneM": 1273
  },
  {
    "stopId": "84700",
    "name": "Gare Mascouche",
    "agencyId": "MRCLM",
    "latitude": 45.72923600000001,
    "longitude": -73.59930266666667,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4709
  },
  {
    "stopId": "84701",
    "name": "Gare Terrebonne",
    "agencyId": "MRCLM",
    "latitude": 45.7279755,
    "longitude": -73.5195545,
    "zoneId": "trb-gt",
    "cityId": "trb",
    "distanceToZoneM": 135
  },
  {
    "stopId": "84868",
    "name": "Terminus Terrebonne",
    "agencyId": "MRCLM",
    "latitude": 45.698049157894744,
    "longitude": -73.65371910526316,
    "zoneId": "trb-cl",
    "cityId": "trb",
    "distanceToZoneM": 760
  },
  {
    "stopId": "85078",
    "name": "Terminus Radisson",
    "agencyId": "MRCLM",
    "latitude": 45.589537,
    "longitude": -73.539602,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2417
  },
  {
    "stopId": "MTL5D",
    "name": "Gare Centrale",
    "agencyId": "TRAINS",
    "latitude": 45.499971,
    "longitude": -73.566717,
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "distanceToZoneM": 52
  },
  {
    "stopId": "MTL3A",
    "name": "Gare Lucien-L'Allier",
    "agencyId": "TRAINS",
    "latitude": 45.494751,
    "longitude": -73.570775,
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "distanceToZoneM": 251
  },
  {
    "stopId": "MTL2A",
    "name": "Gare Vendôme",
    "agencyId": "TRAINS",
    "latitude": 45.473759,
    "longitude": -73.603091,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2114
  },
  {
    "stopId": "MTL1A",
    "name": "Gare Montréal-Ouest",
    "agencyId": "TRAINS",
    "latitude": 45.453666,
    "longitude": -73.641718,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 3063
  },
  {
    "stopId": "LCH1D",
    "name": "Gare Lachine",
    "agencyId": "TRAINS",
    "latitude": 45.448705,
    "longitude": -73.711335,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 3130
  },
  {
    "stopId": "DVL2D",
    "name": "Gare Dorval",
    "agencyId": "TRAINS",
    "latitude": 45.449216,
    "longitude": -73.743113,
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "distanceToZoneM": 1016
  },
  {
    "stopId": "DVL1D",
    "name": "Gare Pine Beach",
    "agencyId": "TRAINS",
    "latitude": 45.449631,
    "longitude": -73.764252,
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "distanceToZoneM": 1413
  },
  {
    "stopId": "PCL3D",
    "name": "Gare Valois",
    "agencyId": "TRAINS",
    "latitude": 45.449754,
    "longitude": -73.790874,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2637
  },
  {
    "stopId": "PCL2D",
    "name": "Gare Pointe-Claire",
    "agencyId": "TRAINS",
    "latitude": 45.447257,
    "longitude": -73.803443,
    "zoneId": "mtl-wi",
    "cityId": "mtl",
    "distanceToZoneM": 1949
  },
  {
    "stopId": "PCL1D",
    "name": "Gare Cedar Park",
    "agencyId": "TRAINS",
    "latitude": 45.442446,
    "longitude": -73.819892,
    "zoneId": "mtl-wi",
    "cityId": "mtl",
    "distanceToZoneM": 1848
  },
  {
    "stopId": "BEA2D",
    "name": "Gare Beaconsfield",
    "agencyId": "TRAINS",
    "latitude": 45.435017,
    "longitude": -73.847419,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 3323
  },
  {
    "stopId": "BEA1D",
    "name": "Gare Beaurepaire",
    "agencyId": "TRAINS",
    "latitude": 45.427412,
    "longitude": -73.887263,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 6186
  },
  {
    "stopId": "BUR1D",
    "name": "Gare Baie-d'Urfé",
    "agencyId": "TRAINS",
    "latitude": 45.419929,
    "longitude": -73.915578,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 8496
  },
  {
    "stopId": "SAB1D",
    "name": "Gare Sainte-Anne-de-Bellevue",
    "agencyId": "TRAINS",
    "latitude": 45.407645,
    "longitude": -73.951234,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 11589
  },
  {
    "stopId": "LIP1D",
    "name": "Gare Île-Perrot",
    "agencyId": "TRAINS",
    "latitude": 45.395939,
    "longitude": -73.965434,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 13208
  },
  {
    "stopId": "TVA1D",
    "name": "Gare Pincourt",
    "agencyId": "TRAINS",
    "latitude": 45.38721,
    "longitude": -73.992275,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 15502
  },
  {
    "stopId": "VAU1D",
    "name": "Gare Dorion",
    "agencyId": "TRAINS",
    "latitude": 45.386428,
    "longitude": -74.008254,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 16626
  },
  {
    "stopId": "VAU8D",
    "name": "Gare Vaudreuil",
    "agencyId": "TRAINS",
    "latitude": 45.399007,
    "longitude": -74.050556,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 19042
  },
  {
    "stopId": "HUD1D",
    "name": "Gare Hudson",
    "agencyId": "TRAINS",
    "latitude": 45.459662,
    "longitude": -74.140908,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 24805
  },
  {
    "stopId": "MTL8D",
    "name": "Gare Parc",
    "agencyId": "TRAINS",
    "latitude": 45.53152,
    "longitude": -73.623773,
    "zoneId": "mtl-mj",
    "cityId": "mtl",
    "distanceToZoneM": 827
  },
  {
    "stopId": "MTL37C",
    "name": "Gare Chabanel",
    "agencyId": "TRAINS",
    "latitude": 45.537058,
    "longitude": -73.658031,
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "distanceToZoneM": 1233
  },
  {
    "stopId": "MTL7D",
    "name": "Gare Bois-de-Boulogne",
    "agencyId": "TRAINS",
    "latitude": 45.540273,
    "longitude": -73.676887,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2252
  },
  {
    "stopId": "LVL24C",
    "name": "Gare De la Concorde",
    "agencyId": "TRAINS",
    "latitude": 45.560323,
    "longitude": -73.709867,
    "zoneId": "lvl-dc",
    "cityId": "lvl",
    "distanceToZoneM": 20
  },
  {
    "stopId": "LVL22C",
    "name": "Gare Vimont",
    "agencyId": "TRAINS",
    "latitude": 45.603774,
    "longitude": -73.742629,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2523
  },
  {
    "stopId": "LVL4C",
    "name": "Gare Sainte-Rose",
    "agencyId": "TRAINS",
    "latitude": 45.625444,
    "longitude": -73.764734,
    "zoneId": "lvl-gs",
    "cityId": "lvl",
    "distanceToZoneM": 30
  },
  {
    "stopId": "ROS2C",
    "name": "Gare Rosemère",
    "agencyId": "TRAINS",
    "latitude": 45.634501,
    "longitude": -73.795742,
    "zoneId": "rsm-gr",
    "cityId": "rsm",
    "distanceToZoneM": 14
  },
  {
    "stopId": "STR4D",
    "name": "Gare Sainte-Thérèse",
    "agencyId": "TRAINS",
    "latitude": 45.636023,
    "longitude": -73.833547,
    "zoneId": "sth-gs",
    "cityId": "sth",
    "distanceToZoneM": 45
  },
  {
    "stopId": "BLA1C",
    "name": "Gare Blainville",
    "agencyId": "TRAINS",
    "latitude": 45.67242,
    "longitude": -73.866176,
    "zoneId": "blv-gb",
    "cityId": "blv",
    "distanceToZoneM": 38
  },
  {
    "stopId": "MIR1C",
    "name": "Gare Mirabel",
    "agencyId": "TRAINS",
    "latitude": 45.711707,
    "longitude": -73.918555,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2810
  },
  {
    "stopId": "SJM1C",
    "name": "Gare Saint-Jérôme",
    "agencyId": "TRAINS",
    "latitude": 45.773171,
    "longitude": -73.999138,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 11983
  },
  {
    "stopId": "STL1B",
    "name": "Gare Saint-Lambert",
    "agencyId": "TRAINS",
    "latitude": 45.49963,
    "longitude": -73.505821,
    "zoneId": "lng-hc",
    "cityId": "lng",
    "distanceToZoneM": 1531
  },
  {
    "stopId": "STH3B",
    "name": "Gare Longueuil-Saint-Hubert",
    "agencyId": "TRAINS",
    "latitude": 45.508118,
    "longitude": -73.433824,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4292
  },
  {
    "stopId": "STB2B",
    "name": "Gare Saint-Bruno",
    "agencyId": "TRAINS",
    "latitude": 45.512029,
    "longitude": -73.374408,
    "zoneId": "lng-psb",
    "cityId": "lng",
    "distanceToZoneM": 793
  },
  {
    "stopId": "SBA2B",
    "name": "Gare Saint-Basile-le-Grand",
    "agencyId": "TRAINS",
    "latitude": 45.523294,
    "longitude": -73.305916,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 5964
  },
  {
    "stopId": "MMS1B",
    "name": "Gare McMasterville",
    "agencyId": "TRAINS",
    "latitude": 45.546059,
    "longitude": -73.229784,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 12405
  },
  {
    "stopId": "MSH1C",
    "name": "Gare Mont-Saint-Hilaire",
    "agencyId": "TRAINS",
    "latitude": 45.577189,
    "longitude": -73.178489,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 17474
  },
  {
    "stopId": "LCH4A",
    "name": "Gare Du Canal",
    "agencyId": "TRAINS",
    "latitude": 45.437597,
    "longitude": -73.655928,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4158
  },
  {
    "stopId": "LSL1A",
    "name": "Gare LaSalle",
    "agencyId": "TRAINS",
    "latitude": 45.425312,
    "longitude": -73.656941,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4728
  },
  {
    "stopId": "SCS2A",
    "name": "Gare Sainte-Catherine",
    "agencyId": "TRAINS",
    "latitude": 45.382037,
    "longitude": -73.600107,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 7119
  },
  {
    "stopId": "SCS1A",
    "name": "Gare Saint-Constant",
    "agencyId": "TRAINS",
    "latitude": 45.373986,
    "longitude": -73.570395,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 7345
  },
  {
    "stopId": "DEL1A",
    "name": "Gare Delson",
    "agencyId": "TRAINS",
    "latitude": 45.366859,
    "longitude": -73.540793,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 6460
  },
  {
    "stopId": "CAN1A",
    "name": "Gare Candiac",
    "agencyId": "TRAINS",
    "latitude": 45.360623,
    "longitude": -73.514832,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 6390
  },
  {
    "stopId": "MTL59C",
    "name": "Gare Ahuntsic",
    "agencyId": "TRAINS",
    "latitude": 45.535014,
    "longitude": -73.662625,
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "distanceToZoneM": 1352
  },
  {
    "stopId": "MTL60C",
    "name": "Gare Côte-de-Liesse",
    "agencyId": "TRAINS",
    "latitude": 45.522252,
    "longitude": -73.662824,
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "distanceToZoneM": 1350
  },
  {
    "stopId": "MTL58C",
    "name": "Gare Sauvé",
    "agencyId": "TRAINS",
    "latitude": 45.549408,
    "longitude": -73.654339,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2377
  },
  {
    "stopId": "MTL57C",
    "name": "Gare Saint-Michel-Montréal-Nord",
    "agencyId": "TRAINS",
    "latitude": 45.583,
    "longitude": -73.630277,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4743
  },
  {
    "stopId": "MTL56C",
    "name": "Gare Saint-Léonard-Montréal-Nord",
    "agencyId": "TRAINS",
    "latitude": 45.600339,
    "longitude": -73.615779,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4728
  },
  {
    "stopId": "MTL55C",
    "name": "Gare Anjou",
    "agencyId": "TRAINS",
    "latitude": 45.617888,
    "longitude": -73.596678,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 3350
  },
  {
    "stopId": "MTL54C",
    "name": "Gare Rivière-des-Prairies",
    "agencyId": "TRAINS",
    "latitude": 45.660656,
    "longitude": -73.539183,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2658
  },
  {
    "stopId": "MTL53C",
    "name": "Gare Pointe-aux-Trembles",
    "agencyId": "TRAINS",
    "latitude": 45.674894,
    "longitude": -73.50535,
    "zoneId": "mtl-rdp",
    "cityId": "mtl",
    "distanceToZoneM": 1656
  },
  {
    "stopId": "LEG1C",
    "name": "Gare Repentigny",
    "agencyId": "TRAINS",
    "latitude": 45.734595,
    "longitude": -73.486192,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2246
  },
  {
    "stopId": "LCN1C",
    "name": "Gare Terrebonne",
    "agencyId": "TRAINS",
    "latitude": 45.728479,
    "longitude": -73.521169,
    "zoneId": "trb-gt",
    "cityId": "trb",
    "distanceToZoneM": 6
  },
  {
    "stopId": "MAS1C",
    "name": "Gare Mascouche",
    "agencyId": "TRAINS",
    "latitude": 45.729678,
    "longitude": -73.598383,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4795
  },
  {
    "stopId": "74104",
    "name": "Terminus Chambly",
    "agencyId": "CITCRC",
    "latitude": 45.432453571428574,
    "longitude": -73.30426157142857,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 9876
  },
  {
    "stopId": "75870",
    "name": "Terminus Brossard",
    "agencyId": "CITCRC",
    "latitude": 45.43706566666666,
    "longitude": -73.43216166666667,
    "zoneId": "lng-rem",
    "cityId": "lng",
    "distanceToZoneM": 166
  },
  {
    "stopId": "76066",
    "name": "Terminus Longueuil",
    "agencyId": "CITCRC",
    "latitude": 45.523806,
    "longitude": -73.522258,
    "zoneId": "lng-tl",
    "cityId": "lng",
    "distanceToZoneM": 81
  }
] as const
