// ქალაქების ფიქსირებული სია კოორდინატებით (რუკისთვის და ფილტრებისთვის)
export const CITIES = [
  { id: 'tbilisi', name: 'თბილისი', lat: 41.7151, lng: 44.8271 },
  { id: 'batumi', name: 'ბათუმი', lat: 41.6168, lng: 41.6367 },
  { id: 'kutaisi', name: 'ქუთაისი', lat: 42.2679, lng: 42.6946 },
  { id: 'rustavi', name: 'რუსთავი', lat: 41.5495, lng: 44.9932 },
  { id: 'gori', name: 'გორი', lat: 41.9842, lng: 44.1158 },
  { id: 'zugdidi', name: 'ზუგდიდი', lat: 42.5088, lng: 41.8709 },
  { id: 'poti', name: 'ფოთი', lat: 42.1462, lng: 41.6719 },
  { id: 'telavi', name: 'თელავი', lat: 41.9198, lng: 45.4731 },
  { id: 'borjomi', name: 'ბორჯომი', lat: 41.8394, lng: 43.3792 },
  { id: 'mestia', name: 'მესტია', lat: 43.045, lng: 42.7272 },
  { id: 'stepantsminda', name: 'სტეფანწმინდა', lat: 42.6571, lng: 44.6425 },
  { id: 'akhaltsikhe', name: 'ახალციხე', lat: 41.639, lng: 42.9826 },
  { id: 'sighnaghi', name: 'სიღნაღი', lat: 41.6205, lng: 45.9213 },
]

const byId = Object.fromEntries(CITIES.map((c) => [c.id, c]))

export const getCity = (id) => byId[id]
export const cityName = (id) => byId[id]?.name ?? id
