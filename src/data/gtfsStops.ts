// Généré par `tsx src/scripts/processGtfsStatic.ts` depuis les archives
// GTFS statiques exo/RTL dans D:/Documents/Transport Dataset. Ne pas éditer à la main —
// re-lancer le script pour rafraîchir. 92 gares/terminus
// majeurs, 45 mappés à une zone (seuil
// 2000m), 47 hors territoire.
// Agences traitées: CITCRC, CITLA, LRRS, MRCLM, RTL, TRAINS.
export type GtfsStop = {
  stopId: string
  stopIds: string[]
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
    "stopIds": [
      "80015"
    ],
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
    "stopIds": [
      "80310",
      "80311",
      "80312",
      "80313",
      "80314",
      "80315",
      "80316",
      "80317",
      "81828",
      "86075",
      "86111",
      "86112",
      "86113"
    ],
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
    "stopIds": [
      "81831",
      "81833"
    ],
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
    "stopIds": [
      "82097",
      "82098",
      "82127"
    ],
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
    "stopIds": [
      "82126"
    ],
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
    "stopIds": [
      "83720",
      "83721",
      "83722",
      "83723",
      "83724",
      "83725",
      "83726",
      "83727",
      "83728",
      "83729",
      "83730",
      "84718"
    ],
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
    "stopIds": [
      "85156"
    ],
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
    "stopIds": [
      "75030"
    ],
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
    "stopIds": [
      "75257"
    ],
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
    "stopIds": [
      "75640",
      "75643",
      "75644",
      "75645",
      "75646"
    ],
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
    "stopIds": [
      "75648",
      "75649",
      "75650",
      "75651"
    ],
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
    "stopIds": [
      "75658",
      "75659",
      "75660"
    ],
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
    "stopIds": [
      "75876",
      "75877",
      "75878",
      "75879"
    ],
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
    "stopIds": [
      "76047",
      "76080",
      "76558",
      "76559",
      "76560",
      "76561"
    ],
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
    "stopIds": [
      "76085"
    ],
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
    "stopIds": [
      "76149"
    ],
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
    "stopIds": [
      "76401"
    ],
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
    "stopIds": [
      "82126"
    ],
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
    "stopIds": [
      "83724",
      "83726"
    ],
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
    "stopIds": [
      "84000"
    ],
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
    "stopIds": [
      "84656"
    ],
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
    "stopIds": [
      "84700",
      "84705",
      "84707"
    ],
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
    "stopIds": [
      "84701",
      "84702"
    ],
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
    "stopIds": [
      "84868",
      "84869",
      "84871",
      "84873",
      "84875",
      "85154",
      "85155",
      "85156",
      "85157",
      "85158",
      "85159",
      "85160",
      "85161",
      "85162",
      "85163",
      "85164",
      "85165",
      "85167",
      "85168"
    ],
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
    "stopIds": [
      "85078",
      "88643"
    ],
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
    "stopIds": [
      "MTL5D",
      "MTL5B"
    ],
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
    "stopIds": [
      "MTL3A",
      "MTL3C"
    ],
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
    "stopIds": [
      "MTL2A",
      "MTL2C"
    ],
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
    "stopIds": [
      "MTL1A",
      "MTL1C"
    ],
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
    "stopIds": [
      "LCH1D",
      "LCH1B"
    ],
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
    "stopIds": [
      "DVL2D",
      "DVL2B"
    ],
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
    "stopIds": [
      "DVL1D",
      "DVL1B"
    ],
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
    "stopIds": [
      "PCL3D",
      "PCL3B"
    ],
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
    "stopIds": [
      "PCL2D",
      "PCL2B"
    ],
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
    "stopIds": [
      "PCL1D",
      "PCL1B"
    ],
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
    "stopIds": [
      "BEA2D",
      "BEA2B"
    ],
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
    "stopIds": [
      "BEA1D",
      "BEA1B"
    ],
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
    "stopIds": [
      "BUR1D",
      "BUR1B"
    ],
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
    "stopIds": [
      "SAB1D",
      "SAB1B"
    ],
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
    "stopIds": [
      "LIP1D",
      "LIP1B"
    ],
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
    "stopIds": [
      "TVA1D",
      "TVA1B"
    ],
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
    "stopIds": [
      "VAU1D",
      "VAU1B"
    ],
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
    "stopIds": [
      "VAU8D",
      "VAU8B"
    ],
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
    "stopIds": [
      "HUD1D",
      "HUD1B"
    ],
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
    "stopIds": [
      "MTL8D",
      "MTL8B"
    ],
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
    "stopIds": [
      "MTL37C",
      "MTL37A"
    ],
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
    "stopIds": [
      "MTL7D",
      "MTL7B"
    ],
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
    "stopIds": [
      "LVL24C",
      "LVL24A"
    ],
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
    "stopIds": [
      "LVL22C",
      "LVL22A"
    ],
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
    "stopIds": [
      "LVL4C",
      "LVL4A"
    ],
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
    "stopIds": [
      "ROS2C",
      "ROS2A"
    ],
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
    "stopIds": [
      "STR4D",
      "STR4B"
    ],
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
    "stopIds": [
      "BLA1C",
      "BLA1A"
    ],
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
    "stopIds": [
      "MIR1C",
      "MIR1A"
    ],
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
    "stopIds": [
      "SJM1C",
      "SJM1A"
    ],
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
    "stopIds": [
      "STL1B",
      "STL1D"
    ],
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
    "stopIds": [
      "STH3B",
      "STH3D"
    ],
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
    "stopIds": [
      "STB2B",
      "STB2D"
    ],
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
    "stopIds": [
      "SBA2B",
      "SBA2D"
    ],
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
    "stopIds": [
      "MMS1B",
      "MMS1D"
    ],
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
    "stopIds": [
      "MSH1C",
      "MSH1A"
    ],
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
    "stopIds": [
      "LCH4A",
      "LCH4C"
    ],
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
    "stopIds": [
      "LSL1A",
      "LSL1C"
    ],
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
    "stopIds": [
      "SCS2A",
      "SCS2C"
    ],
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
    "stopIds": [
      "SCS1A",
      "SCS1C"
    ],
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
    "stopIds": [
      "DEL1A",
      "DEL1C"
    ],
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
    "stopIds": [
      "CAN1A",
      "CAN1C"
    ],
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
    "stopIds": [
      "MTL59C",
      "MTL59A"
    ],
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
    "stopIds": [
      "MTL60C",
      "MTL60A"
    ],
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
    "stopIds": [
      "MTL58C",
      "MTL58A"
    ],
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
    "stopIds": [
      "MTL57C",
      "MTL57A"
    ],
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
    "stopIds": [
      "MTL56C",
      "MTL56A"
    ],
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
    "stopIds": [
      "MTL55C",
      "MTL55A"
    ],
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
    "stopIds": [
      "MTL54C",
      "MTL54A"
    ],
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
    "stopIds": [
      "MTL53C",
      "MTL53A"
    ],
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
    "stopIds": [
      "LEG1C",
      "LEG1A"
    ],
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
    "stopIds": [
      "LCN1C",
      "LCN1A"
    ],
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
    "stopIds": [
      "MAS1C",
      "MAS1A"
    ],
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
    "stopIds": [
      "74104",
      "74116",
      "74117",
      "74119",
      "74129",
      "74130",
      "74131"
    ],
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
    "stopIds": [
      "75870",
      "75873",
      "75875"
    ],
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
    "stopIds": [
      "76066"
    ],
    "name": "Terminus Longueuil",
    "agencyId": "CITCRC",
    "latitude": 45.523806,
    "longitude": -73.522258,
    "zoneId": "lng-tl",
    "cityId": "lng",
    "distanceToZoneM": 81
  },
  {
    "stopId": "9999",
    "stopIds": [
      "9999",
      "1001",
      "1002",
      "4415",
      "4416",
      "4417",
      "4418"
    ],
    "name": "Terminus Longueuil",
    "agencyId": "RTL",
    "latitude": 45.52397809711791,
    "longitude": -73.52140864006763,
    "zoneId": "lng-tl",
    "cityId": "lng",
    "distanceToZoneM": 36
  },
  {
    "stopId": "3382",
    "stopIds": [
      "3382"
    ],
    "name": "Terminus Centre-Ville",
    "agencyId": "RTL",
    "latitude": 45.4984402900159,
    "longitude": -73.5668389536944,
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "distanceToZoneM": 209
  },
  {
    "stopId": "4429",
    "stopIds": [
      "4429",
      "5923",
      "5925",
      "5927"
    ],
    "name": "Terminus Panama",
    "agencyId": "RTL",
    "latitude": 45.46648137126388,
    "longitude": -73.46898319906452,
    "zoneId": "lng-mc",
    "cityId": "lng",
    "distanceToZoneM": 622
  },
  {
    "stopId": "5117",
    "stopIds": [
      "5117"
    ],
    "name": "Terminus De Montarville",
    "agencyId": "RTL",
    "latitude": 45.6007686545747,
    "longitude": -73.4503549968615,
    "zoneId": "bch-c",
    "cityId": "lng",
    "distanceToZoneM": 1284
  },
  {
    "stopId": "5417",
    "stopIds": [
      "5417"
    ],
    "name": "Gare St-Bruno",
    "agencyId": "RTL",
    "latitude": 45.5127806302333,
    "longitude": -73.3743816931576,
    "zoneId": "lng-psb",
    "cityId": "lng",
    "distanceToZoneM": 872
  },
  {
    "stopId": "5624",
    "stopIds": [
      "5624"
    ],
    "name": "Gare Longueuil - St-Hubert",
    "agencyId": "RTL",
    "latitude": 45.5081017553201,
    "longitude": -73.4365445738991,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 4089
  },
  {
    "stopId": "5767",
    "stopIds": [
      "5767"
    ],
    "name": "Terminus Brossard",
    "agencyId": "RTL",
    "latitude": 45.436900917515,
    "longitude": -73.4315403720757,
    "zoneId": "lng-rem",
    "cityId": "lng",
    "distanceToZoneM": 149
  },
  {
    "stopId": "5869",
    "stopIds": [
      "5869"
    ],
    "name": "Terminus Radisson",
    "agencyId": "RTL",
    "latitude": 45.5897603319547,
    "longitude": -73.5381375802226,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2459
  },
  {
    "stopId": "6183",
    "stopIds": [
      "6183"
    ],
    "name": "Terminus Georges-Gagné",
    "agencyId": "RTL",
    "latitude": 45.3850686351167,
    "longitude": -73.5478981538109,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 5214
  },
  {
    "stopId": "6184",
    "stopIds": [
      "6184",
      "6223"
    ],
    "name": "Terminus Montcalm-Candiac",
    "agencyId": "RTL",
    "latitude": 45.39346661270175,
    "longitude": -73.51683090054965,
    "zoneId": null,
    "cityId": null,
    "distanceToZoneM": 2964
  },
  {
    "stopId": "6187",
    "stopIds": [
      "6187",
      "6222"
    ],
    "name": "Terminus La Prairie",
    "agencyId": "RTL",
    "latitude": 45.42581980742495,
    "longitude": -73.48049898832289,
    "zoneId": "lap-c",
    "cityId": "lng",
    "distanceToZoneM": 1745
  }
] as const
