import { z } from 'zod';

export type RDFLiteral = {
  type: 'literal';
  value: string;
  datatype?: string; // Optional, e.g., for decimals or dateTime
  'xml:lang'?: string; // Optional, e.g., for language-tagged literals
};

export type RDFURI = {
  type: 'uri';
  value: string;
};

export type Place = {
  resource: RDFURI;
  label: RDFLiteral;
  type: RDFLiteral;
  cityLabel: RDFLiteral;
  citySameAs: RDFURI;
  latitude: RDFLiteral;
  longitude: RDFLiteral;
  ratingValue: RDFLiteral;
  ratingPointInTime: RDFLiteral;
  comment: RDFLiteral;
  sameAs: RDFURI;
};

export type PlaceDetail = {
  placeName?: RDFLiteral;
  latitude?: RDFLiteral;
  longitude?: RDFLiteral;
  desc?: RDFLiteral;
  categoryLabel?: RDFLiteral;
  valRating?: RDFLiteral;
  timeRating?: RDFLiteral;
  city?: RDFURI;
  cityName?: RDFLiteral;
  wikidataCityURI?: RDFURI;
  timePrice?: RDFLiteral;
  priceGeneral?: RDFLiteral;
  priceWeekday?: RDFLiteral;
  priceWeekend?: RDFLiteral;
  wikidataPlaceURI?: RDFURI;
  wdImageURL?: RDFURI;
  officialWebsite?: RDFURI;
  aggregatedCategoryLabels?: RDFLiteral;
  visitorNum?: RDFLiteral;
  visitorYear?: RDFLiteral;
  timeSpent?: RDFLiteral;
};

export type HasSameAs = {
  hasSameAs: RDFLiteral;
};

export type PlaceSearch = {
  resource: RDFURI;
  label: RDFLiteral;
  category: RDFURI;
  categoryLabel: RDFLiteral;
  city: RDFURI;
  ratingValue: RDFLiteral;
  valuePrice: RDFLiteral;
  valuePriceWeekday: RDFLiteral;
  valuePriceWeekend: RDFLiteral;
  sameAs: RDFURI;
};

export type City = {
  resource: RDFURI;
  label: RDFLiteral;
  sameAs: RDFURI;
  placeCount: RDFLiteral;
};

export type CityChip = {
  resource: RDFURI;
};

export type Category = {
  resource: RDFURI;
  label: RDFLiteral;
};

export type ResponseList<T> = {
  head: {
    vers: string[];
  };
  results: {
    bindings: T[];
  };
};

export const SearchSchema = z.object({
  place: z.string(),
});
