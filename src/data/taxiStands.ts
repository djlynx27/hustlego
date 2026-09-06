// Généré par `tsx src/scripts/mapTaxiStands.ts` depuis les données ouvertes
// Ville de Montréal (postestaxi.geojson.json). Ne pas éditer à la main —
// re-lancer le script pour rafraîchir. 236 postes mappés sur
// 353 (56 inactifs, 61 hors zone à >3000m).
export type TaxiStand = {
  standId: string
  zoneId: string
  cityId: string
  latitude: number
  longitude: number
  capacity: number
  address: string
  distanceToZoneM: number
}

export const TAXI_STANDS: readonly TaxiStand[] = [
  {
    "standId": "46-901",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.60515710287878,
    "longitude": -73.55186122030716,
    "capacity": 3,
    "address": "6500, boul. Joseph-Renaud / Boul. Wilfrid Pelletier",
    "distanceToZoneM": 451
  },
  {
    "standId": "10-733",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.53510784109334,
    "longitude": -73.69896770688479,
    "capacity": 5,
    "address": "2820 de Salaberry. Centre Normandie, IGA (poste privé COOP de Montréal)",
    "distanceToZoneM": 2613
  },
  {
    "standId": "46-321",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.610407085325086,
    "longitude": -73.54740393171596,
    "capacity": 5,
    "address": "Au coin de l'avenue Azilda et l'avenue Chaumont. Situé au nord-est de l'intersection",
    "distanceToZoneM": 720
  },
  {
    "standId": "27-842",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.56678750240697,
    "longitude": -73.65547622408144,
    "capacity": 7,
    "address": "Au 1745 rue Fleury E. Poste privé de Taxi Coop. Épicerie Métro",
    "distanceToZoneM": 2175
  },
  {
    "standId": "27-743",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.53755981941242,
    "longitude": -73.65489980793456,
    "capacity": 1,
    "address": "Au coin de la rue Chabanel O et la rue Meilleur. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1143
  },
  {
    "standId": "27-211",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.54646274748941,
    "longitude": -73.63830614092421,
    "capacity": 2,
    "address": "Au coin de la rue Lajeunesse et le boul. Crémazie E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2100
  },
  {
    "standId": "27-945",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.524881802928235,
    "longitude": -73.71079963009413,
    "capacity": 1,
    "address": "Louisbourg / Laurentien. situé au sud-est de l'intersection",
    "distanceToZoneM": 2453
  },
  {
    "standId": "10-694",
    "zoneId": "lvl-chomedey-notre",
    "cityId": "lvl",
    "latitude": 45.53152372,
    "longitude": -73.71882742,
    "capacity": 2,
    "address": "Au coin de la rue De Serres et la rue Grenet. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2110
  },
  {
    "standId": "9-923",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47256113964197,
    "longitude": -73.61206243383788,
    "capacity": 4,
    "address": "Au coin de l'avenue Girouard et la rue Sherbrooke O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2799
  },
  {
    "standId": "9-930",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.460346423688605,
    "longitude": -73.62947099098511,
    "capacity": 4,
    "address": "Au coin du boul. De Maisonneuve O et la rue Park Row E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2548
  },
  {
    "standId": "26-882",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.49778079503686,
    "longitude": -73.65750530213853,
    "capacity": 5,
    "address": "Au coin de la rue Ferrier et le boul. Décarie. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2719
  },
  {
    "standId": "15-143",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.44607099327033,
    "longitude": -73.60220432432862,
    "capacity": 6,
    "address": "rue Lacroix (Métro Angrignon) / boul. Des Trinitiares. Situé dans la boucle au bout de la rue Lacroix",
    "distanceToZoneM": 140
  },
  {
    "standId": "38-846",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.53374907,
    "longitude": -73.58067924,
    "capacity": 3,
    "address": "Au coin de la rue Fabre et le boul. Saint-Joseph E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1089
  },
  {
    "standId": "38-854",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.52206111556752,
    "longitude": -73.60208129830426,
    "capacity": 5,
    "address": "Au coin de la rue Saint-Viateur O et l'avenue Du Parc . Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1501
  },
  {
    "standId": "15-144",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4510099,
    "longitude": -73.59298000000001,
    "capacity": 3,
    "address": "Au coin de bd Monk et la rue Allard. Situé au sud-est de l'interesection",
    "distanceToZoneM": 1024
  },
  {
    "standId": "15-142",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.46191799422963,
    "longitude": -73.58789046627042,
    "capacity": 1,
    "address": "rue Le Caron / rue Laurendeau.. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2171
  },
  {
    "standId": "38-850",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.52750991982854,
    "longitude": -73.5870008472557,
    "capacity": 2,
    "address": "Au coin de la rue Berri et le boul. Saint-Joseph E. Situé au nord-est de l'intersection",
    "distanceToZoneM": 489
  },
  {
    "standId": "48-338",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.594423330871756,
    "longitude": -73.52360386032717,
    "capacity": 2,
    "address": "Au coin de la rue A. A-Desroches et la rue Hochelaga. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2938
  },
  {
    "standId": "35-638",
    "zoneId": "mtl-ph",
    "cityId": "mtl",
    "latitude": 45.535426246246686,
    "longitude": -73.60391807713307,
    "capacity": 2,
    "address": "Au coin de l'avenue Chateaubriand et la rue Beaubien E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 139
  },
  {
    "standId": "35-641",
    "zoneId": "mtl-ph",
    "cityId": "mtl",
    "latitude": 45.5347588,
    "longitude": -73.6043464,
    "capacity": 4,
    "address": "Au coin de la rue De Saint-Vallier et la rue Jean-Talon E . Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 165
  },
  {
    "standId": "10-92",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.52468917,
    "longitude": -73.71102702,
    "capacity": 1,
    "address": "Au coin de la rue De Louisbourg et le boul. Laurentien. Situé au sud-est de l'intersection (marché Salaberry)",
    "distanceToZoneM": 2458
  },
  {
    "standId": "27-210",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.544328807612175,
    "longitude": -73.6401085864054,
    "capacity": 2,
    "address": "Au coin de l'avenue Henri-Julien et le boul. Cremazie E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1863
  },
  {
    "standId": "49-349",
    "zoneId": "mtl-rdp",
    "cityId": "mtl",
    "latitude": 45.64213343116583,
    "longitude": -73.50467078710251,
    "capacity": 5,
    "address": "Au 1484 boul. Saint-Jean-Baptiste / Les galeries Saint-Jean-Baptiste.  .",
    "distanceToZoneM": 1987
  },
  {
    "standId": "27-475",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.55091445800651,
    "longitude": -73.65577805016073,
    "capacity": 2,
    "address": "Au coin de la rue Berri et la rue Sauvé E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2275
  },
  {
    "standId": "21-819",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.51853510952077,
    "longitude": -73.55218630265506,
    "capacity": 4,
    "address": "Au 1400 boul. René-Levesque E (Maison de Radio-Canada)",
    "distanceToZoneM": 793
  },
  {
    "standId": "20-424",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.498214821092155,
    "longitude": -73.5734514803566,
    "capacity": 2,
    "address": "Au 1240 Drummond (Hôtel Best Western Plus)",
    "distanceToZoneM": 210
  },
  {
    "standId": "15-596",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47819221487209,
    "longitude": -73.58386628095093,
    "capacity": 3,
    "address": "Au coin du Ch. De la station et la rue Notre-Dame O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 638
  },
  {
    "standId": "13-125",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4309342,
    "longitude": -73.6351105,
    "capacity": 7,
    "address": "Avenue Dollard (Maxi). Boul. Newman, poste privé à Taxi Angrignon (coin nord-est)",
    "distanceToZoneM": 2949
  },
  {
    "standId": "22-671",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52507810047524,
    "longitude": -73.56222715158998,
    "capacity": 4,
    "address": "Au 2099 rue Alexandre-DeSève (Hôpital Notre-Dame, pavillon J.A.DeSève)",
    "distanceToZoneM": 1113
  },
  {
    "standId": "27-474",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.54302132777408,
    "longitude": -73.65204925767212,
    "capacity": 2,
    "address": "Chabanel O. / St-Urbain. Situé au nord-est de l'intersection sur Chabanel O.",
    "distanceToZoneM": 1645
  },
  {
    "standId": "31-636",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.546471012640524,
    "longitude": -73.63718605120084,
    "capacity": 4,
    "address": "Au coin de la rue Lajeunesse et la rue Crémazie E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 2020
  },
  {
    "standId": "44-857",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.5727129785681,
    "longitude": -73.55745577799098,
    "capacity": 8,
    "address": "Au coin du boul. L'Assomption et l'avenue Des Saules. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1574
  },
  {
    "standId": "9-924",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.46434028324315,
    "longitude": -73.61593375758059,
    "capacity": 2,
    "address": "Au coin de l'avenue Beaconsfield et la rue Saint-Jacques. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2242
  },
  {
    "standId": "15-754",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47419397806124,
    "longitude": -73.5872703016052,
    "capacity": 2,
    "address": "Au coin de la rue Notre-Dame O et le Sq.Sir-George-Étienne-Cartier. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1156
  },
  {
    "standId": "7-920",
    "zoneId": "mtl-valiquette-pitfield",
    "cityId": "mtl",
    "latitude": 45.482347955406375,
    "longitude": -73.72334857672121,
    "capacity": 8,
    "address": "boul. Pitfield au coin du boul. de la Côte-Vertu. Situé au nord-ouest de l'intersection sur le boul. Pitfield",
    "distanceToZoneM": 2901
  },
  {
    "standId": "46-805",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.599072690398565,
    "longitude": -73.55900916983643,
    "capacity": 2,
    "address": "Au 7250 boul. Des Roseraies. Poste privé de Taxi Hochelaga. Épicerie Adonis",
    "distanceToZoneM": 1020
  },
  {
    "standId": "20-770",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.497548456856244,
    "longitude": -73.55533886931153,
    "capacity": 5,
    "address": "Au coin de la rue Wellington et la rue Queen. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 974
  },
  {
    "standId": "5-36",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.45329096181508,
    "longitude": -73.74152228042601,
    "capacity": 4,
    "address": "555, boul. McMillan. Hôtel Sheraton. Poste privé de la compagnie Taxi Coop de l'Ouest",
    "distanceToZoneM": 762
  },
  {
    "standId": "20-458",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.50440823209937,
    "longitude": -73.56559374736025,
    "capacity": 3,
    "address": "Au coin de la rue Saint-Alexandre et le boul. René-Levesque O. Situé au nord-est de l'intersection",
    "distanceToZoneM": 451
  },
  {
    "standId": "38-845",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.53086207431055,
    "longitude": -73.58335304266802,
    "capacity": 2,
    "address": "Au coin de la rue De la Roche et le boul. Saint-Joseph E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 753
  },
  {
    "standId": "27-918",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.55387942251001,
    "longitude": -73.63824898783571,
    "capacity": 2,
    "address": "1000, ave. Émile-Journault / Complexe Sportif Claude-Robillard",
    "distanceToZoneM": 2531
  },
  {
    "standId": "23-185",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.56586912397786,
    "longitude": -73.5535723455078,
    "capacity": 2,
    "address": "Au 5000 rue Sherbrooke E (Hotel Universel). Poste privé de Taxi Hochelaga",
    "distanceToZoneM": 757
  },
  {
    "standId": "20-421",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.4969553,
    "longitude": -73.57342069999999,
    "capacity": 2,
    "address": "Au 1180 rue De la Montagne (Hotel Novotel). Poste privé de Taxi Pontiac",
    "distanceToZoneM": 181
  },
  {
    "standId": "27-839",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.55948328876621,
    "longitude": -73.6338815696945,
    "capacity": 2,
    "address": "Au coin de l'avenue Émile-Journault et l'avenue Papineau. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2763
  },
  {
    "standId": "46-508",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.602096921076836,
    "longitude": -73.5759501454595,
    "capacity": 4,
    "address": "Au coin du boul. Des Galeries-D'Anjou et la rue Jarry E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1685
  },
  {
    "standId": "15-655",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.4805256638776,
    "longitude": -73.57558711957398,
    "capacity": 4,
    "address": "Au 147 Av. Atwater (Stationnement Super C). Poste privé de Taxi Coop Montréal",
    "distanceToZoneM": 405
  },
  {
    "standId": "15-765",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.48080519399696,
    "longitude": -73.57711011219482,
    "capacity": 3,
    "address": "Au coin de la rue Duvernay et l'av. Atwater. Situé au nord-est de l'intersection",
    "distanceToZoneM": 302
  },
  {
    "standId": "20-942",
    "zoneId": "mtl-mg",
    "cityId": "mtl",
    "latitude": 45.50853730834761,
    "longitude": -73.5807022593857,
    "capacity": 3,
    "address": "3775, University / Hôpital neurologique de Montréal. Situé au sud-est de l'adresse près du pavillon Duff",
    "distanceToZoneM": 237
  },
  {
    "standId": "13-742",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.43342629057996,
    "longitude": -73.6289310690338,
    "capacity": 6,
    "address": "Au coin de la rue Lise et le boul. Newman. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2395
  },
  {
    "standId": "7-813",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.49803330178101,
    "longitude": -73.70399126029662,
    "capacity": 8,
    "address": "Au 3131 boul. de la Côte-Vertu (RBC). Poste privé de Taxi Champlain",
    "distanceToZoneM": 2442
  },
  {
    "standId": "38-270",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.51787483817781,
    "longitude": -73.5879948878357,
    "capacity": 5,
    "address": "Au coin de l'avenue Mont-Royal O et l'avenue De L'esplanade . Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 792
  },
  {
    "standId": "15-138",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.45696865673589,
    "longitude": -73.58236090066374,
    "capacity": 3,
    "address": "rue Drake / rue Jolicoeur. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 2082
  },
  {
    "standId": "7-815",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.50304441899878,
    "longitude": -73.66801643685898,
    "capacity": 8,
    "address": "Au coin du 1015 rue Décarie et du boul. de la Côte-Vertu. Poste privé Taxelco",
    "distanceToZoneM": 1725
  },
  {
    "standId": "20-434",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50107663243742,
    "longitude": -73.56511608095093,
    "capacity": 5,
    "address": "Au coin du 671 De la Gauchetière Ouest et le boul. Robert-Bourassa. Situé au nord-est de l'intersection",
    "distanceToZoneM": 184
  },
  {
    "standId": "23-177",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.55121870967869,
    "longitude": -73.5410571227539,
    "capacity": 5,
    "address": "Au coin de l'avenue Desjardins et la rue Ontario E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1186
  },
  {
    "standId": "48-866",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.58264812461223,
    "longitude": -73.54307913783487,
    "capacity": 4,
    "address": "Au coin du boul. Langelier et la rue Sherbrooke E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 2668
  },
  {
    "standId": "15-744",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.483432208729276,
    "longitude": -73.56264749947508,
    "capacity": 3,
    "address": "Au coin de la rue Richardson et la rue Shearer. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1307
  },
  {
    "standId": "20-448",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50001454067628,
    "longitude": -73.55648751799924,
    "capacity": 8,
    "address": "Au coin de la rue Mcgill et la Place d'Youville. Situé au sud-est de l'intersection",
    "distanceToZoneM": 836
  },
  {
    "standId": "20-696",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.49986992373441,
    "longitude": -73.56836462565616,
    "capacity": 15,
    "address": "Au coin de la rue Mansfield et le boul René-Levesque O. Situé au sud-est de l'intersection",
    "distanceToZoneM": 103
  },
  {
    "standId": "20-613",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49624184141794,
    "longitude": -73.58570120118867,
    "capacity": 2,
    "address": "Au coin du Ch. de la Côte-des-Neiges et la rue Seaforth. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 785
  },
  {
    "standId": "20-467",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50385781373937,
    "longitude": -73.56926618650817,
    "capacity": 8,
    "address": "Au coin de l'Avenue Union et la rue Sainte-Catherine O. Situé au nord-est de l'intersection",
    "distanceToZoneM": 427
  },
  {
    "standId": "35-640",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.53885833602515,
    "longitude": -73.61369419071707,
    "capacity": 2,
    "address": "Au coin de la rue Saint-Vallier et la rue De Bellechasse. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 42
  },
  {
    "standId": "20-465",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49240185638556,
    "longitude": -73.57663628888548,
    "capacity": 2,
    "address": "Au coin de la rue Saint-Mathieu et le boul. René-Levesque O. Situé au nord-est de l'intersection",
    "distanceToZoneM": 537
  },
  {
    "standId": "31-634",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.54375548659487,
    "longitude": -73.62819099216722,
    "capacity": 4,
    "address": "Au coin de la rue Lajeunesse et la rue Jarry E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1257
  },
  {
    "standId": "27-840",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.55551372790679,
    "longitude": -73.62087838332826,
    "capacity": 4,
    "address": "Au 8305 avenue Papineau. Poste privé de Taxelco. Épicerie Maxi",
    "distanceToZoneM": 1780
  },
  {
    "standId": "20-609",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49662263930744,
    "longitude": -73.59040771614686,
    "capacity": 5,
    "address": "Au 1650 av. Cédar / Hôpital général de Montréal. Situé au nord-ouest de l'adresse sur av. Cédar",
    "distanceToZoneM": 1147
  },
  {
    "standId": "33-236",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.53084704250136,
    "longitude": -73.64300537214149,
    "capacity": 4,
    "address": "Au coin de l'avenue Wiseman et la rue De Liège . Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 466
  },
  {
    "standId": "46-769",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59546922441712,
    "longitude": -73.55654811872228,
    "capacity": 2,
    "address": "Au coin de la rue Beaubien E et le boul. Des Galeries-D'Anjou. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1394
  },
  {
    "standId": "20-438",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.49024069751333,
    "longitude": -73.58353890000001,
    "capacity": 5,
    "address": "Au coin de la rue Lambert-Closse et la rue Sainte-Catherine O. Situé au nord-est de l'intersection",
    "distanceToZoneM": 867
  },
  {
    "standId": "20-411",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50306854725463,
    "longitude": -73.56034954232791,
    "capacity": 3,
    "address": "Au coin du 360 Saint-Antoine O et la rue Saint-Pierre. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 616
  },
  {
    "standId": "38-844",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.528081152993956,
    "longitude": -73.57931900014592,
    "capacity": 4,
    "address": "Au coin de l'avenue Christophe-Colomb et l'avenue du Mont-Royal. Situé au nord-est de l'intersection.",
    "distanceToZoneM": 530
  },
  {
    "standId": "38-715",
    "zoneId": "mtl-mg",
    "cityId": "mtl",
    "latitude": 45.51043555516835,
    "longitude": -73.57580879206546,
    "capacity": 10,
    "address": "Au coin de la rue Prince-Arthur O et l'avenue Du Parc . Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 460
  },
  {
    "standId": "20-446",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.49898879796768,
    "longitude": -73.56644355952454,
    "capacity": 6,
    "address": "Au coin de la rue Mansfield et la rue De la Gauchetière O. Situé au sud-est de l'intersection",
    "distanceToZoneM": 157
  },
  {
    "standId": "5-45",
    "zoneId": "mtl-transcanadienne-autoroute",
    "cityId": "mtl",
    "latitude": 45.462280899734296,
    "longitude": -73.82656717724609,
    "capacity": 3,
    "address": "6700, rte. Transcanadienne. Hôtel Double Tree. Poste privé de la compagnie Taxi Coop de l'Ouest",
    "distanceToZoneM": 299
  },
  {
    "standId": "26-941",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.4764045152813,
    "longitude": -73.60631262209017,
    "capacity": 5,
    "address": "Avenue Grey /rue Sherbrooke ouest. Situé au coin sud-est de l'intersection.",
    "distanceToZoneM": 2223
  },
  {
    "standId": "48-343",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.60092592753438,
    "longitude": -73.52026748663775,
    "capacity": 4,
    "address": "Au coin de la rue Pierre-Tétrault et la rue Hochelaga. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2889
  },
  {
    "standId": "23-176",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54356787719785,
    "longitude": -73.54591813383786,
    "capacity": 4,
    "address": "Au coin de la rue Cuvillier et la rue Ontario E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1794
  },
  {
    "standId": "27-944",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.5414367977343,
    "longitude": -73.6529587007721,
    "capacity": 2,
    "address": "Chabanel O/ Esplanade. situé au nord-est de l'intersection",
    "distanceToZoneM": 1490
  },
  {
    "standId": "20-413",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50306616963522,
    "longitude": -73.56612584498293,
    "capacity": 7,
    "address": "Au coin de la Cote du Beaver Hall et le boul. Rene-Levesque O. Situé au sud-est de l'intersection",
    "distanceToZoneM": 319
  },
  {
    "standId": "13-121",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4429883,
    "longitude": -73.6225402,
    "capacity": 8,
    "address": "Rue Léger. De Cannes-Brûlées",
    "distanceToZoneM": 1485
  },
  {
    "standId": "13-128",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4474589,
    "longitude": -73.61018100000001,
    "capacity": 8,
    "address": "7081 Boul. Newman (Maxi). Boul. Angrignon, poste privé à Taxi Angrignon",
    "distanceToZoneM": 509
  },
  {
    "standId": "20-879",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.502339991726984,
    "longitude": -73.56820281058958,
    "capacity": 14,
    "address": "Au coin du boul. Robert-Bourassa et la Place Monseigneur-Charbonneau. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 240
  },
  {
    "standId": "48-791",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59040806366157,
    "longitude": -73.55951630685422,
    "capacity": 3,
    "address": "Au coin de la rue François-Boivin et la rue Beaubien E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1975
  },
  {
    "standId": "15-594",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47870350010422,
    "longitude": -73.56938047357175,
    "capacity": 2,
    "address": "Au coin de la rue Centre et la rue Charlevoix. Situé au sud-est de l'intersection",
    "distanceToZoneM": 916
  },
  {
    "standId": "48-863",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59024056897398,
    "longitude": -73.54017790422972,
    "capacity": 4,
    "address": "Au coin de la rue Faradon et la rue Du Trianon. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2327
  },
  {
    "standId": "15-797",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49318780382408,
    "longitude": -73.56431928354493,
    "capacity": 4,
    "address": "Au coin de la rue Notre-Dame O est rue De la Montagne. Situé au sud-est de l'intersection. (Épicerie Métro Plus)",
    "distanceToZoneM": 594
  },
  {
    "standId": "3-29",
    "zoneId": "mtl-valiquette-pitfield",
    "cityId": "mtl",
    "latitude": 45.503620711983,
    "longitude": -73.78057847301636,
    "capacity": 10,
    "address": "9562, boul. Gouin O.. Bowl-O-Drome. Poste privé Taxi Coop de l'Ouest",
    "distanceToZoneM": 2340
  },
  {
    "standId": "42-300",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59246443345275,
    "longitude": -73.57290463757323,
    "capacity": 6,
    "address": "Au 7445 boul. Langelier. Poste privé de Taxi Hochelaga. Walmart",
    "distanceToZoneM": 2171
  },
  {
    "standId": "7-887",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.493207496288235,
    "longitude": -73.7003602246063,
    "capacity": 1,
    "address": "7000, Place Robert-Joncas / Hôtel Courtyard .",
    "distanceToZoneM": 2713
  },
  {
    "standId": "27-946",
    "zoneId": "lvl-chomedey-notre",
    "cityId": "lvl",
    "latitude": 45.531594530083744,
    "longitude": -73.7187427084363,
    "capacity": 2,
    "address": "De Serres / Grenet . situé au sud-ouest de l'intersection",
    "distanceToZoneM": 2110
  },
  {
    "standId": "38-772",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.52539856080343,
    "longitude": -73.57431507058209,
    "capacity": 5,
    "address": "Au coin de la rue Rachel E et l'avenue Du Parc-La fontaine. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 695
  },
  {
    "standId": "20-681",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.495697750433024,
    "longitude": -73.57291883467099,
    "capacity": 3,
    "address": "Au coin du boul. René-Levesque O et la rue Lucien-L'Allier. Situé au sud-est de l'intersection",
    "distanceToZoneM": 274
  },
  {
    "standId": "15-141",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.456896355728794,
    "longitude": -73.59505700368747,
    "capacity": 1,
    "address": "Rue Jolicoeur / boul. Monk. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1398
  },
  {
    "standId": "38-848",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.52678083730375,
    "longitude": -73.58616399738821,
    "capacity": 2,
    "address": "Au coin du 480 rue Gilford et la rue Berri. Situé au sud-est de l'intersection",
    "distanceToZoneM": 385
  },
  {
    "standId": "49-690",
    "zoneId": "mtl-rdp",
    "cityId": "mtl",
    "latitude": 45.66930931353723,
    "longitude": -73.50534541534421,
    "capacity": 10,
    "address": "Au coin du boul. De la Rousselière et de la rue Sherbrooke E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1035
  },
  {
    "standId": "22-169",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.53326438742079,
    "longitude": -73.55162928207017,
    "capacity": 8,
    "address": "Au coin de la rue Du Havre et la rue Ontario E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2150
  },
  {
    "standId": "23-178",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54672755401565,
    "longitude": -73.55133391484986,
    "capacity": 4,
    "address": "Au coin de la rue Joliette et la rue Hochelaga. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1398
  },
  {
    "standId": "38-264",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.520534392895286,
    "longitude": -73.56786060372542,
    "capacity": 4,
    "address": "Au coin de la rue Cherrier et la rue Saint-André. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 802
  },
  {
    "standId": "20-452",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49875280172043,
    "longitude": -73.57052725529479,
    "capacity": 3,
    "address": "Au coin de la rue Peel et le boul. René-Levesque O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 214
  },
  {
    "standId": "38-806",
    "zoneId": "mtl-mg",
    "cityId": "mtl",
    "latitude": 45.50629840287917,
    "longitude": -73.57265853901481,
    "capacity": 4,
    "address": "Au coin de la rue Sherbrooke O et la rue Aylmer. Situé au nord-est de l'intersection",
    "distanceToZoneM": 483
  },
  {
    "standId": "5-762",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.44579899539779,
    "longitude": -73.74090027909853,
    "capacity": 4,
    "address": "Au 396 rue Dorval (Esso)",
    "distanceToZoneM": 1432
  },
  {
    "standId": "23-184",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.543091975193484,
    "longitude": -73.55738635189817,
    "capacity": 1,
    "address": "Au coin de la rue Préfontaine et la rue Sherbrooke E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1870
  },
  {
    "standId": "48-864",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.57877340146011,
    "longitude": -73.5325541496195,
    "capacity": 4,
    "address": "Au coin de l'avenue De Granby et la rue Hochelaga. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2598
  },
  {
    "standId": "35-538",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.54180404046599,
    "longitude": -73.590476990139,
    "capacity": 4,
    "address": "Au coin de la rue Chabot et le boul. Rosemont. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1257
  },
  {
    "standId": "44-860",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.57575866708983,
    "longitude": -73.56208848992537,
    "capacity": 6,
    "address": "Au coin du boul. Rosemont et la rue Châtelain. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2023
  },
  {
    "standId": "33-237",
    "zoneId": "mtl-mj",
    "cityId": "mtl",
    "latitude": 45.52627047357399,
    "longitude": -73.62482643075055,
    "capacity": 2,
    "address": "Au coin de l'avenue Outremont et la rue Jean-Talon O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1307
  },
  {
    "standId": "21-387",
    "zoneId": "mtl-ca",
    "cityId": "mtl",
    "latitude": 45.50565404153001,
    "longitude": -73.52579042883605,
    "capacity": 3,
    "address": "Au 1 Avenue Du Casino",
    "distanceToZoneM": 16
  },
  {
    "standId": "44-856",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.55461198,
    "longitude": -73.57931107,
    "capacity": 2,
    "address": "Au coin de la 13e avenue et le boul. Rosemont. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2265
  },
  {
    "standId": "48-340",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.60775460553625,
    "longitude": -73.52853959206544,
    "capacity": 2,
    "address": "Au coin de la rue Desmarteaux et la rue Sherbrooke E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2136
  },
  {
    "standId": "16 - 890",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.46302220208495,
    "longitude": -73.56655083062742,
    "capacity": 5,
    "address": "Situé sur la rue de L'Église au coin de la rue Wellington (sud-est de l'intersection)",
    "distanceToZoneM": 2437
  },
  {
    "standId": "21-393",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.507505294176624,
    "longitude": -73.56307986983643,
    "capacity": 8,
    "address": "Au coin du 175 boul. René-levesque O et le complexe Desjardins. Situé au nord-est de l'intersection",
    "distanceToZoneM": 288
  },
  {
    "standId": "22-172",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52044815312354,
    "longitude": -73.55432871954343,
    "capacity": 6,
    "address": "Au coin de la rue Sainte-Catherine E et la rue Plessis. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 795
  },
  {
    "standId": "21-911",
    "zoneId": "mtl-ch",
    "cityId": "mtl",
    "latitude": 45.51101488594983,
    "longitude": -73.55766879444273,
    "capacity": 11,
    "address": "Rue Sanguinet au coin de la rue De la Gauchetière E.. Il s'agit du poste d'attente pour le CHUM.",
    "distanceToZoneM": 69
  },
  {
    "standId": "22-950",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52627527,
    "longitude": -73.54583993,
    "capacity": 8,
    "address": "Au coin de la rue Fullum et la rue Jean Langlois. Situé dans le rond-point Fullum. \n",
    "distanceToZoneM": 1720
  },
  {
    "standId": "20-113",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.4899144049726,
    "longitude": -73.58578910957033,
    "capacity": 5,
    "address": "Au coin de l'avenue Atwater et le boul. De Maisonneuve O. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 916
  },
  {
    "standId": "27-943",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.537908466837074,
    "longitude": -73.67888585305631,
    "capacity": 2,
    "address": "Boulevard Henri-Bourassa O / Bois-de-Boulogne. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2492
  },
  {
    "standId": "46-906",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59976161461044,
    "longitude": -73.56311463967285,
    "capacity": 2,
    "address": "7999, boul. des Galeries d'Anjou. Près du restaurant La Belle et la Boeuf. Poste privé de Taxi Hochelaga",
    "distanceToZoneM": 1070
  },
  {
    "standId": "35-693",
    "zoneId": "mtl-ph",
    "cityId": "mtl",
    "latitude": 45.53880648359106,
    "longitude": -73.600965499354,
    "capacity": 3,
    "address": "Au coin de la rue Beaubien E et la rue De la Roche. Situé au nord-est de l'intersection",
    "distanceToZoneM": 471
  },
  {
    "standId": "22-170",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52710404071346,
    "longitude": -73.54813241945521,
    "capacity": 5,
    "address": "Au coin de la rue Fullum et la rue Sainte-Catherine E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1674
  },
  {
    "standId": "20-449",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.501724302947316,
    "longitude": -73.57409029999997,
    "capacity": 6,
    "address": "Au coin de la rue Metcalfe et le boul. De Maisonneuve O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 520
  },
  {
    "standId": "16-147",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.44373877231892,
    "longitude": -73.57710644550781,
    "capacity": 5,
    "address": "Au coin de l'avenue Bannantyne et le boul. Lasalle (Hopital Douglas). Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2113
  },
  {
    "standId": "20-943",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50049729,
    "longitude": -73.56553688,
    "capacity": 3,
    "address": "Au coin du 777 De la Gauchetière Ouest et le boul. Robert-Bourassa. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 131
  },
  {
    "standId": "15-782",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.486829856569,
    "longitude": -73.54923937857359,
    "capacity": 3,
    "address": "Au 225 rue Bridge (Poste Canada). Poste privé Taxi Diamond",
    "distanceToZoneM": 1955
  },
  {
    "standId": "21-403",
    "zoneId": "mtl-vp",
    "cityId": "mtl",
    "latitude": 45.50558376120755,
    "longitude": -73.55363914127804,
    "capacity": 5,
    "address": "Au coin du boul. Saint-Laurent et la rue Saint-Paul. Situé au sud-est de l'intersection",
    "distanceToZoneM": 369
  },
  {
    "standId": "49-346",
    "zoneId": "mtl-rdp",
    "cityId": "mtl",
    "latitude": 45.65282410300077,
    "longitude": -73.48966608095094,
    "capacity": 4,
    "address": "Au 12 900 rue Notre-Dame E. Centre Le Cardinal",
    "distanceToZoneM": 1434
  },
  {
    "standId": "33-478",
    "zoneId": "mtl-mj",
    "cityId": "mtl",
    "latitude": 45.52966685,
    "longitude": -73.62270501,
    "capacity": 5,
    "address": "Au coin de la rue Hutchison et la rue Jean-Talon O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 907
  },
  {
    "standId": "21-785",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.50827418,
    "longitude": -73.56385242,
    "capacity": 5,
    "address": "Au coin de la rue Saint-Urbain et la rie Sainte-Catherine O. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 210
  },
  {
    "standId": "22-171",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52537112578774,
    "longitude": -73.56454861157545,
    "capacity": 8,
    "address": "Au coin de la rue Plessis et la rue Sherbrooke E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1173
  },
  {
    "standId": "5-35",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.45603009098139,
    "longitude": -73.74668258885498,
    "capacity": 400,
    "address": "975, boul. Roméo-Vachon. Aéroport de Montréal-Trudeau. Ligne et bassin Taxis et Limousines",
    "distanceToZoneM": 260
  },
  {
    "standId": "15-801",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49313045,
    "longitude": -73.55754915,
    "capacity": 2,
    "address": "au coin de la rue Wellington et la rue Peel. situé au coin sud-ouest de l'intersection",
    "distanceToZoneM": 1043
  },
  {
    "standId": "7-71",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.49075493501157,
    "longitude": -73.69004094337765,
    "capacity": 3,
    "address": "Au 9191 boul.Cavendish (IKEA). Poste privé de Taxi Diamond",
    "distanceToZoneM": 2684
  },
  {
    "standId": "5-27",
    "zoneId": "mtl-wi",
    "cityId": "mtl",
    "latitude": 45.44815836858193,
    "longitude": -73.8331791693115,
    "capacity": 4,
    "address": "160, Av. Stillview. Hôpital Lakeshore (Urgence). Poste privé de Taxi Coop de l'Ouest.",
    "distanceToZoneM": 1488
  },
  {
    "standId": "22-173",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.51762552500916,
    "longitude": -73.55315026715084,
    "capacity": 8,
    "address": "Au coin du boul. René-levesque e et la rue De la Visitation. Situé au sud-est de l'intersection",
    "distanceToZoneM": 680
  },
  {
    "standId": "11-481",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4605407,
    "longitude": -73.62891239999999,
    "capacity": 5,
    "address": "Au coin du boul. De Maisonneuve O et la rue Park Row E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2528
  },
  {
    "standId": "5-40",
    "zoneId": "mtl-transcanadienne-autoroute",
    "cityId": "mtl",
    "latitude": 45.46556415742894,
    "longitude": -73.83095760845947,
    "capacity": 10,
    "address": "6815, route Transcanadienne. Fairview Pointe-Claire. Poste privé de la compagnie Taxi Coop de l'Ouest",
    "distanceToZoneM": 773
  },
  {
    "standId": "20-460",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49917043895496,
    "longitude": -73.57350311904906,
    "capacity": 5,
    "address": "Au coin de la rue Stanley et Sainte-Catherine O. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 280
  },
  {
    "standId": "21-399",
    "zoneId": "mtl-ch",
    "cityId": "mtl",
    "latitude": 45.5126945624108,
    "longitude": -73.55857433862303,
    "capacity": 4,
    "address": "Au coin de la rue Saint-Denis et le boul. René-levesque O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 197
  },
  {
    "standId": "38-763",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.51202428159057,
    "longitude": -73.56977033457952,
    "capacity": 5,
    "address": "Au coin de la rue Clark et la rue Sherbrooke O. Situé nord-est de l'intersection",
    "distanceToZoneM": 475
  },
  {
    "standId": "30-223",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.56705486650968,
    "longitude": -73.59109497067038,
    "capacity": 6,
    "address": "Au coin de la 23e avenue et la rue Jean-Talon E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2926
  },
  {
    "standId": "9-932",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47344486285827,
    "longitude": -73.60546485974123,
    "capacity": 6,
    "address": "Au coin de l'avenue Northcliffe et le boul. De Maisonneuve O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2293
  },
  {
    "standId": "46-878",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.599468622269306,
    "longitude": -73.56745642142641,
    "capacity": 2,
    "address": "Au 7895 boul. Des Galeries-D'Anjou. Poste privé de Taxi Coop de l'Est. La Baie d'Hudson",
    "distanceToZoneM": 1302
  },
  {
    "standId": "48-865",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.581706607575406,
    "longitude": -73.54223957130279,
    "capacity": 6,
    "address": "Au 3235 avenue De Granby. Poste privé de Taxi Coop. Centre commercial Domaine",
    "distanceToZoneM": 2583
  },
  {
    "standId": "15-800",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49307386,
    "longitude": -73.55619201,
    "capacity": 2,
    "address": "au coin de la rue Smith et la rue Peel. situé au coin sud-est",
    "distanceToZoneM": 1143
  },
  {
    "standId": "44-657",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.5441224,
    "longitude": -73.5774145116394,
    "capacity": 3,
    "address": "Au 2535 rue Masson. Poste privé Taxi Coop. Maxi",
    "distanceToZoneM": 2270
  },
  {
    "standId": "26-914",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.52758382750313,
    "longitude": -73.64905156826171,
    "capacity": 10,
    "address": "Au 2305 Ch.Rockland (Centre d'achat Rockland). Poste privé de Taxi Champlain",
    "distanceToZoneM": 132
  },
  {
    "standId": "21-781",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.50522566819983,
    "longitude": -73.5639564693115,
    "capacity": 2,
    "address": "Au 380 boul. René-Levesque O (Derrière hôtel Marriot Courtyard). Poste privé de Taxi Pontiac",
    "distanceToZoneM": 407
  },
  {
    "standId": "9-933",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47217216883194,
    "longitude": -73.60059510793457,
    "capacity": 1,
    "address": "1001, boul. Décarie",
    "distanceToZoneM": 2045
  },
  {
    "standId": "38-855",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.520244604217424,
    "longitude": -73.59516763706779,
    "capacity": 5,
    "address": "Au coin de l'avenue Laurier O et la rue Jeanne-Mance. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1037
  },
  {
    "standId": "12-118",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.48742594080842,
    "longitude": -73.58678092824175,
    "capacity": 2,
    "address": "Rue Sainte-Catherine ouest. coin Avenue Wood. Situé au Nord-Ouest de l'intersection sur la rue Sainte-Catherine O.",
    "distanceToZoneM": 757
  },
  {
    "standId": "5-748",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.45588036441182,
    "longitude": -73.75209931772156,
    "capacity": 3,
    "address": "800, Pl. Leigh-Capreol. Hôtel Marriott - Aéroport de Montréal",
    "distanceToZoneM": 238
  },
  {
    "standId": "38-851",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.53702470737394,
    "longitude": -73.57080030480574,
    "capacity": 4,
    "address": "Au coin de la rue Messier et l'avenue du Mont-Royal. Situé nord-ouest de l'intersection",
    "distanceToZoneM": 1725
  },
  {
    "standId": "48-868",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.586716670910995,
    "longitude": -73.55465126194758,
    "capacity": 4,
    "address": "Au coin du boul. Rosemont et le boul. Langelier. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2369
  },
  {
    "standId": "27-720",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.555247054393206,
    "longitude": -73.66808075899962,
    "capacity": 4,
    "address": "Au coin du 10650 rue Lajeunesse et le boul. Henri-Bourassa E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1203
  },
  {
    "standId": "48-862",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.57695346542996,
    "longitude": -73.54684925026959,
    "capacity": 4,
    "address": "Au coin de la rue De Cadillac et la rue Sherbrooke E. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1989
  },
  {
    "standId": "48-788",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.56891468606902,
    "longitude": -73.54670826011888,
    "capacity": 2,
    "address": "Au 3075 boul. De L'Assomption. Métro de l'Assomption",
    "distanceToZoneM": 1120
  },
  {
    "standId": "49-350",
    "zoneId": "mtl-rdp",
    "cityId": "mtl",
    "latitude": 45.654911893409476,
    "longitude": -73.51107596249618,
    "capacity": 3,
    "address": "Au 12695 rue Sherbrooke E. Poste privé de Taxi Coop de l'Est. Épicerie Super C",
    "distanceToZoneM": 737
  },
  {
    "standId": "16-151",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.45279683010753,
    "longitude": -73.57629775239258,
    "capacity": 2,
    "address": "Au coin de la rue Woodland et l'Avenue Bannantyne. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 2289
  },
  {
    "standId": "44-310",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.55534327774547,
    "longitude": -73.57065010044607,
    "capacity": 4,
    "address": "Au coin de la 17e avenue et la rue Masson. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1592
  },
  {
    "standId": "16-152",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.46282032204946,
    "longitude": -73.5658780362235,
    "capacity": 6,
    "address": "De l'Église / Ross. Situé au sud-est de l'intersection sur De l'Église",
    "distanceToZoneM": 2479
  },
  {
    "standId": "38-718",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.51792342168916,
    "longitude": -73.5693658591299,
    "capacity": 6,
    "address": "Au coin de la rue Saint-Denis et la rue De Malines. Situé au nord-est de l'intersection. ITHQ",
    "distanceToZoneM": 716
  },
  {
    "standId": "44-858",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.57934035936484,
    "longitude": -73.57042157636897,
    "capacity": 7,
    "address": "Au coin de la rue Saint-Zotique E et la rue Jeanne-Jugan. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2693
  },
  {
    "standId": "15-139",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.46095333622844,
    "longitude": -73.59704713124808,
    "capacity": 2,
    "address": "Rue Denonville / Boul. Monk. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1749
  },
  {
    "standId": "20-444",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.500355055493095,
    "longitude": -73.57557536085204,
    "capacity": 8,
    "address": "Au coin du boul. De Maisonneuve O et la rue Stanley. Situé au nord-est de l'intersection",
    "distanceToZoneM": 352
  },
  {
    "standId": "23-180",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54160230145006,
    "longitude": -73.55479043068846,
    "capacity": 2,
    "address": "Au coin de la rue Moreau et la rue Hochelaga. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1990
  },
  {
    "standId": "46-323",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.600046630908516,
    "longitude": -73.56719892936098,
    "capacity": 2,
    "address": "Au 7895 boul. Des Galeries-D'Anjou. Poste privé de Taxi Hochelaga. La Baie D'Hudson",
    "distanceToZoneM": 1241
  },
  {
    "standId": "21-512",
    "zoneId": "mtl-vp",
    "cityId": "mtl",
    "latitude": 45.50657764409293,
    "longitude": -73.55646610251621,
    "capacity": 3,
    "address": "Au coin de la rue Saint-Laurent et la rue Saint-Jacques. Situé au nord-est de l'intersection",
    "distanceToZoneM": 420
  },
  {
    "standId": "7-64",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.50945567046777,
    "longitude": -73.67476451531371,
    "capacity": 4,
    "address": "Au coin du boul. Decarie et de la rue Du College. Situé au sud-est de l'intersection",
    "distanceToZoneM": 851
  },
  {
    "standId": "9-931",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47162017407979,
    "longitude": -73.60171126826172,
    "capacity": 14,
    "address": "Au 1001 boul. Décarie (Site GLEN) - Réserve",
    "distanceToZoneM": 2151
  },
  {
    "standId": "33-238",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.52920975,
    "longitude": -73.63702155,
    "capacity": 3,
    "address": "Au coin de l'avenue Wiseman et la rue Jarry O. Situé au sud-est de l'intersection",
    "distanceToZoneM": 856
  },
  {
    "standId": "21-723",
    "zoneId": "mtl-uq",
    "cityId": "mtl",
    "latitude": 45.50584338087859,
    "longitude": -73.56037179377898,
    "capacity": 4,
    "address": "Au coin de l'avenue Viger O et la rue Côté. Situé au nord-est de l'intersection",
    "distanceToZoneM": 548
  },
  {
    "standId": "27-779",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.571622684824966,
    "longitude": -73.65062817934569,
    "capacity": 2,
    "address": "Au coin de la rue Fleury E et l'avenue Merritt (Hopital Fleury). Situé au sud-est de l'intersection",
    "distanceToZoneM": 2737
  },
  {
    "standId": "21-386",
    "zoneId": "mtl-ch",
    "cityId": "mtl",
    "latitude": 45.51373224042066,
    "longitude": -73.55741464285279,
    "capacity": 2,
    "address": "Au coin du 1199 rue Berri (Fairfield Inn) et le boul. René-Levesque E",
    "distanceToZoneM": 267
  },
  {
    "standId": "26-505",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.50480917568142,
    "longitude": -73.63714638703311,
    "capacity": 5,
    "address": "Au 6825 Chemin de la Côte-des-Neiges. Poste privé de Taxi Diamond. Épicerie Maxi",
    "distanceToZoneM": 2766
  },
  {
    "standId": "16-145",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4564690079286,
    "longitude": -73.57215642929077,
    "capacity": 3,
    "address": "Au coin de la 5e Avenue et la rue De Verdun. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2743
  },
  {
    "standId": "35-692",
    "zoneId": "mtl-mj",
    "cityId": "mtl",
    "latitude": 45.531757200708235,
    "longitude": -73.61195182747906,
    "capacity": 2,
    "address": "Au coin du boul.Saint-Laurent et la rue Saint-Zotique E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 526
  },
  {
    "standId": "20-428",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49349995436386,
    "longitude": -73.57392511349184,
    "capacity": 3,
    "address": "Au 1005 rue Guy (Hotel Espresso). Poste privé de Taxi Hochelaga",
    "distanceToZoneM": 434
  },
  {
    "standId": "16-606",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.47053027771151,
    "longitude": -73.56543581055905,
    "capacity": 1,
    "address": "Au coin de la rue Rushbrooke et la rue Caisse. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1763
  },
  {
    "standId": "20-440",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.49598728675269,
    "longitude": -73.58063719521482,
    "capacity": 4,
    "address": "Au coin de l'Avenue Lincoln et la rue Guy. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 406
  },
  {
    "standId": "5-37",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.44488992519177,
    "longitude": -73.74144036931153,
    "capacity": 10,
    "address": "310, av. Dorval. Les jardins Dorval - Épicerie Maxi. Poste privé de la compagnie Taxi Diamond de l'Ouest",
    "distanceToZoneM": 1503
  },
  {
    "standId": "44-843",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.54833438762879,
    "longitude": -73.59216785509489,
    "capacity": 7,
    "address": "Au coin de l'avenue Louis-Hébert et la rue Beaubien. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1262
  },
  {
    "standId": "20-614",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.500750247791885,
    "longitude": -73.57879712988586,
    "capacity": 2,
    "address": "Au coin du 3450 rue Drummond et Place Mountain. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 463
  },
  {
    "standId": "44-568",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54500790240152,
    "longitude": -73.56170672750854,
    "capacity": 2,
    "address": "Au 2925 rue Rachel E. Poste privé Taxelco. Provigo",
    "distanceToZoneM": 1795
  },
  {
    "standId": "20-432",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.50204398720204,
    "longitude": -73.57617359881135,
    "capacity": 2,
    "address": "Au 1050 rue Sherbrooke Ouest (Hotel Omni). Poste privé de Taxi Véco",
    "distanceToZoneM": 541
  },
  {
    "standId": "27-838",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.558120342809254,
    "longitude": -73.63692809412056,
    "capacity": 2,
    "address": "Au 8935 avenue André-Grasset. Épicerie Métro André-Grasset.",
    "distanceToZoneM": 2790
  },
  {
    "standId": "20-466",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.500492861115795,
    "longitude": -73.55830545183716,
    "capacity": 5,
    "address": "Au coin de la rue Saint-Maurice et la rue Mcgill. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 694
  },
  {
    "standId": "20-899",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49514959237528,
    "longitude": -73.57243338332823,
    "capacity": 2,
    "address": "1390, boul. René-Lévesque O.. Hôtel Holiday Inn Suites. Le poste est situé derrière l'hôtel. Poste privé de Pontiac",
    "distanceToZoneM": 283
  },
  {
    "standId": "31-631",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.54582482801659,
    "longitude": -73.63785123772686,
    "capacity": 2,
    "address": "Au coin de la rue Berri et le boul. Crémazie E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2041
  },
  {
    "standId": "38-852",
    "zoneId": "mtl-mj",
    "cityId": "mtl",
    "latitude": 45.52502304,
    "longitude": -73.6108645,
    "capacity": 2,
    "address": "Au coin de la rue Hutchison et l'avenue Van Horne . Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1256
  },
  {
    "standId": "21-812",
    "zoneId": "mtl-vp",
    "cityId": "mtl",
    "latitude": 45.50242179777604,
    "longitude": -73.55288743972778,
    "capacity": 30,
    "address": "Croisières Montréal - Grand Quai du Port de Montréal. Poste d'attente privé Véco",
    "distanceToZoneM": 702
  },
  {
    "standId": "20-788",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.50715143827001,
    "longitude": -73.56911480426788,
    "capacity": 2,
    "address": "355 Blvd De Maisonneuve ouest au coin de la rue Bleury (Hotêl Honey Rose). Poste d'attente privé Taxi Pontiac",
    "distanceToZoneM": 244
  },
  {
    "standId": "21-405",
    "zoneId": "mtl-uq",
    "cityId": "mtl",
    "latitude": 45.506529195032385,
    "longitude": -73.55979228465577,
    "capacity": 2,
    "address": "Au coin du 999 rue Saint-Urbain (Holiday Inn) et la rue Viger O. Poste privé de Taxi Pontiac",
    "distanceToZoneM": 490
  },
  {
    "standId": "44-908",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54159271253005,
    "longitude": -73.56487921957398,
    "capacity": 5,
    "address": "Le poste est situé au coin des rues Molson et William-Tremblay (sud-est).",
    "distanceToZoneM": 2246
  },
  {
    "standId": "31-228",
    "zoneId": "mtl-jt",
    "cityId": "mtl",
    "latitude": 45.54713221758332,
    "longitude": -73.61834621377056,
    "capacity": 5,
    "address": "Au coin de la rue De Normanville et la rue Villeray. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 963
  },
  {
    "standId": "21-738",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50369207779791,
    "longitude": -73.55980014603273,
    "capacity": 2,
    "address": "Au 270 rue Saint-Antoine O (Hotel Westin). Poste privé de Taxi Véco",
    "distanceToZoneM": 689
  },
  {
    "standId": "21-404",
    "zoneId": "mtl-vp",
    "cityId": "mtl",
    "latitude": 45.50621849436834,
    "longitude": -73.55553720740966,
    "capacity": 4,
    "address": "Au coin du boul. Saint-Laurent et la rue Notre-Dame E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 390
  },
  {
    "standId": "38-272",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.517918347386676,
    "longitude": -73.58167934457015,
    "capacity": 2,
    "address": "Au coin de la rue Rachel O et le boul. Saint-Laurent . Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 695
  },
  {
    "standId": "16-148",
    "zoneId": "mtl-lachine",
    "cityId": "mtl",
    "latitude": 45.4481313611597,
    "longitude": -73.5771472280029,
    "capacity": 5,
    "address": "Au coin de l'avenue Brown et l'avenue Bannantyne. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2108
  },
  {
    "standId": "30-629",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.55917041393142,
    "longitude": -73.59939479847526,
    "capacity": 8,
    "address": "Au coin du boul. Shaughnessy et le boul. Saint-Michel. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1875
  },
  {
    "standId": "31-227",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.54544913540849,
    "longitude": -73.60937690682476,
    "capacity": 5,
    "address": "Au coin de la rue De Lanaudière et la rue Jean-Talon E. Situé au nord-est de l'intersection.",
    "distanceToZoneM": 347
  },
  {
    "standId": "23-181",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.5444856534763,
    "longitude": -73.53782153115236,
    "capacity": 4,
    "address": "Au coin de la rue Nicolet et la rue Sainte-Catherine E. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 1941
  },
  {
    "standId": "22-168",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.52369599529935,
    "longitude": -73.5515042883606,
    "capacity": 8,
    "address": "Au coin de la rue Dorion et la rue Sainte-Catherine E. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1213
  },
  {
    "standId": "20-459",
    "zoneId": "mtl-cb",
    "cityId": "mtl",
    "latitude": 45.49774487514418,
    "longitude": -73.57152006745912,
    "capacity": 3,
    "address": "Au 1201 boul. René-Levesque O (Centre Sheraton). Poste privé de Taxi Champlain",
    "distanceToZoneM": 164
  },
  {
    "standId": "31-229",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.55298428928876,
    "longitude": -73.60268640491995,
    "capacity": 4,
    "address": "Au coin de l'avenue Louis-Hébert et la rue Jean-Talon E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1143
  },
  {
    "standId": "20 - 904",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50190536852262,
    "longitude": -73.57125742009885,
    "capacity": 6,
    "address": "Av. McGill College coin rue Cathcart",
    "distanceToZoneM": 363
  },
  {
    "standId": "15-595",
    "zoneId": "mtl-ll",
    "cityId": "mtl",
    "latitude": 45.479376811145535,
    "longitude": -73.55903290950926,
    "capacity": 4,
    "address": "Au coin de la rue Charon et la rue Wellington. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 1638
  },
  {
    "standId": "5-34",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.44835795790181,
    "longitude": -73.74329014550779,
    "capacity": 4,
    "address": "boul. Montréal-Toronto / Rond-Point Dorval. Terminus STM",
    "distanceToZoneM": 1093
  },
  {
    "standId": "38-913",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.52415715381263,
    "longitude": -73.58137260226495,
    "capacity": 4,
    "address": "Sur la rue Rivard au coin de la rue Utilités publiques . Au Sud-Est de l'intersection. Situé au Sud de l'édicule Mont-Royal",
    "distanceToZoneM": 130
  },
  {
    "standId": "23-910",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.547239219814024,
    "longitude": -73.54374641534423,
    "capacity": 4,
    "address": "au coin de Avenue Valois et la rue Ontario E. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1455
  },
  {
    "standId": "44-311",
    "zoneId": "mtl-belanger-chambord",
    "cityId": "mtl",
    "latitude": 45.54644772002215,
    "longitude": -73.57607889149222,
    "capacity": 4,
    "address": "Au coin de la 3e avenue et la rue Masson. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2400
  },
  {
    "standId": "20-456",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50197481192606,
    "longitude": -73.56712045634458,
    "capacity": 2,
    "address": "Au coin du boul. René-Levesque O et le boul. Robert-Bourassa. Situé au sud-est de l'intersection",
    "distanceToZoneM": 186
  },
  {
    "standId": "7-65",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.51325629464034,
    "longitude": -73.68175818490295,
    "capacity": 4,
    "address": "Au coin du  boul. Édouard-Laurin et du boul. Décarie. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 165
  },
  {
    "standId": "20-758",
    "zoneId": "mtl-qs",
    "cityId": "mtl",
    "latitude": 45.50779168632687,
    "longitude": -73.57140215648349,
    "capacity": 2,
    "address": "Au 380 rue Sherbrooke Ouest (Hotel Hilton Garden Inn). Poste privé de Taxi Pontiac",
    "distanceToZoneM": 385
  },
  {
    "standId": "22-810",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.51834019510486,
    "longitude": -73.55635539364016,
    "capacity": 4,
    "address": "Au coin de la rue Sainte-Catherine E et la rue Montcalm. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 516
  },
  {
    "standId": "20-622",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.50118395093767,
    "longitude": -73.57733548769681,
    "capacity": 4,
    "address": "Au coin de la rue Stanley et la rue Sherbrooke O. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 462
  },
  {
    "standId": "20-437",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.49996839859588,
    "longitude": -73.56624879073792,
    "capacity": 12,
    "address": "Au 895 De la Gauchetière Ouest (Gare Centrale). Poste privé de Taxelco",
    "distanceToZoneM": 83
  },
  {
    "standId": "5-44",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.44846438154334,
    "longitude": -73.74151931904908,
    "capacity": 12,
    "address": "755, boul. Montréal-Toronto. Via Rail Dorval",
    "distanceToZoneM": 1152
  },
  {
    "standId": "10-85",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.537951013712856,
    "longitude": -73.67798012858884,
    "capacity": 8,
    "address": "Au coin du boul. Henri-Bourassa O et l'avenue Bois-de-Boulogne. Situé au sud-est de l'intersection",
    "distanceToZoneM": 2495
  },
  {
    "standId": "38-937",
    "zoneId": "mtl-mr",
    "cityId": "mtl",
    "latitude": 45.53020894595734,
    "longitude": -73.57688999189122,
    "capacity": 5,
    "address": "Au coin de la rue de Lanaudière et l'avenue du Mont-Royal E.. Situé sud-est de l'intersection",
    "distanceToZoneM": 832
  },
  {
    "standId": "5-43",
    "zoneId": "mtl-wi",
    "cityId": "mtl",
    "latitude": 45.44543227949213,
    "longitude": -73.81547910370483,
    "capacity": 4,
    "address": "325, boul. Saint-Jean. Épicerie Métro. Poste privé de la compagnie Taxi Coop de l'Ouest",
    "distanceToZoneM": 1592
  },
  {
    "standId": "26-915",
    "zoneId": "mtl-rk",
    "cityId": "mtl",
    "latitude": 45.50820688335183,
    "longitude": -73.63747460475463,
    "capacity": 4,
    "address": "Au coin de la rue Jean-Talon et l'avenue Dieppe. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2400
  },
  {
    "standId": "48-861",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.57329517335842,
    "longitude": -73.5358357317383,
    "capacity": 2,
    "address": "Au coin de la rue De Cadillac et la rue Hochelaga. Situé au nord-est de l'intersection",
    "distanceToZoneM": 1953
  },
  {
    "standId": "27-207",
    "zoneId": "lvl-ct",
    "cityId": "lvl",
    "latitude": 45.55435863528944,
    "longitude": -73.66794861481937,
    "capacity": 2,
    "address": "10639, Berri / boul. Henri-Bourassa E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1261
  },
  {
    "standId": "7-793",
    "zoneId": "mtl-cv",
    "cityId": "mtl",
    "latitude": 45.4930624,
    "longitude": -73.69990680000001,
    "capacity": 1,
    "address": "Place Robert-Joncas / Hôtel Courtyard (arriere)",
    "distanceToZoneM": 2710
  },
  {
    "standId": "21-394",
    "zoneId": "mtl-ca",
    "cityId": "mtl",
    "latitude": 45.50707528020413,
    "longitude": -73.52462128570556,
    "capacity": 18,
    "address": "Au Casino de Montréal, réserve au sud-est",
    "distanceToZoneM": 198
  },
  {
    "standId": "38-853",
    "zoneId": "mtl-ph",
    "cityId": "mtl",
    "latitude": 45.525931482149986,
    "longitude": -73.59888839695486,
    "capacity": 5,
    "address": "Au coin du boul. Saint-Laurent et la rue Saint-Viateur. Situé au sud-est de l'intersection",
    "distanceToZoneM": 1232
  },
  {
    "standId": "21-402",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.51535554169436,
    "longitude": -73.55875256403198,
    "capacity": 6,
    "address": "Au coin de la rue Saint-Hubert et la rue Sainte-Catherine E. Situé au sud-est de l'intersection",
    "distanceToZoneM": 185
  },
  {
    "standId": "48-341",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.596435162747646,
    "longitude": -73.53492631296695,
    "capacity": 8,
    "address": "Au coin de la rue Honoré-Beaugrand et la rue Sherbrooke E. Situé au nord-ouest de l'intersection",
    "distanceToZoneM": 2084
  },
  {
    "standId": "7-814",
    "zoneId": "mtl-valiquette-pitfield",
    "cityId": "mtl",
    "latitude": 45.48747336572323,
    "longitude": -73.7171502465576,
    "capacity": 4,
    "address": "Au 4545 boul. de la Côte-Vertu (Hotel Days Inn). Poste privé de Taxi Diamond",
    "distanceToZoneM": 2976
  },
  {
    "standId": "5-741",
    "zoneId": "mtl-yul",
    "cityId": "mtl",
    "latitude": 45.45285494444704,
    "longitude": -73.74073161957398,
    "capacity": 2,
    "address": "500, boul. McMillan. Hôtel A Loft. Poste privé de la compagnie Taxi Coop de l'Ouest",
    "distanceToZoneM": 840
  },
  {
    "standId": "20-673",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.501708666214235,
    "longitude": -73.56728730793458,
    "capacity": 3,
    "address": "Au coin du 800 boul. René-Levesque O et le boul. Robert-Bourassa. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 157
  },
  {
    "standId": "20-787",
    "zoneId": "mtl-cs",
    "cityId": "mtl",
    "latitude": 45.497835632968304,
    "longitude": -73.57690397857363,
    "capacity": 6,
    "address": "Au coin de la rue Crescent et la rue Nick-Auf Der Maur. Siuté au nord-est de l'intersection",
    "distanceToZoneM": 117
  },
  {
    "standId": "20-904",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.50146305987272,
    "longitude": -73.57036198161468,
    "capacity": 6,
    "address": "Av. McGill College / Cathcart. Situé au Nord-Ouest de l'intersection sur av. McGill College",
    "distanceToZoneM": 278
  },
  {
    "standId": "48-867",
    "zoneId": "mtl-anjou",
    "cityId": "mtl",
    "latitude": 45.59340055918141,
    "longitude": -73.54114071772153,
    "capacity": 5,
    "address": "Au 7455 rue Sherbrooke E. Poste privé Taxelco. Épicerie Maxi",
    "distanceToZoneM": 1993
  },
  {
    "standId": "44-312",
    "zoneId": "mtl-so",
    "cityId": "mtl",
    "latitude": 45.54870517635146,
    "longitude": -73.57466483103053,
    "capacity": 4,
    "address": "Au coin de la 7e avenue et la rue Masson. Situé au nord-est de l'intersection",
    "distanceToZoneM": 2187
  },
  {
    "standId": "21-818",
    "zoneId": "mtl-bq",
    "cityId": "mtl",
    "latitude": 45.525431258051476,
    "longitude": -73.56468808644422,
    "capacity": 3,
    "address": "Au coin de la rue Sherbrooke E et la rue Plessis . Situé au sud-est de l'intersection",
    "distanceToZoneM": 1182
  },
  {
    "standId": "20-463",
    "zoneId": "mtl-gc",
    "cityId": "mtl",
    "latitude": 45.502557135290346,
    "longitude": -73.55921481324464,
    "capacity": 2,
    "address": "Au coin de la rue Saint-Jacques et Saint-Pierre. Situé au sud-ouest de l'intersection",
    "distanceToZoneM": 671
  }
] as const
