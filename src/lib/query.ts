import axios from 'axios';

export const fetchImageFromWikidata = async (entityId: string) => {
  const endpoint = 'https://query.wikidata.org/sparql';
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>

    SELECT ?image WHERE {
      wd:${entityId} wdt:P18 ?image .
    }
  `;

  try {
    const response = await axios.get(endpoint, {
      params: {
        query,
        format: 'json',
      },
      headers: {
        Accept: 'application/json',
      },
    });

    const bindings = response.data.results.bindings;
    if (bindings.length > 0) {
      return bindings[0].image.value; // Return the image URL
    }
    return null; // No image found
  } catch (error) {
    console.error('Error fetching image from Wikidata:', error);
    return null;
  }
};

export const getTop10Query = `
    PREFIX : <http://kgbunshin.org/>
    PREFIX kgb: <http://kgbunshin.org/data/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?resource ?type ?label ?cityLabel ?citySameAs ?latitude ?longitude ?ratingValue ?ratingPointInTime ?comment ?citySameAs ?sameAs
    WHERE {
        ?resource a ?o ;
                            rdfs:label ?label ;
                            kgb:city ?city ;
                            kgb:latitude ?latitude ;
                            kgb:longitude ?longitude ;
                    kgb:rating [a kgb:Rating ;
                                    kgb:pointInTime ?ratingPointInTime ;
                                    kgb:valueRating ?ratingValue] ;
                            rdfs:comment ?comment .
            
            Optional{
                    ?city owl:sameAs ?citySameAs 
            }
            
            Optional{
                    ?city rdfs:label ?cityLabel 
            }

            optional{
                    ?resource owl:sameAs ?sameAs .
            }
            
        ?o rdfs:label ?type ;
            rdfs:subClassOf kgb:Place .
    }
    ORDER BY DESC(?ratingValue)
    LIMIT 10
`;

export const getCityMostPlaces = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX data: <http://kgbunshin.org/data/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX kgb: <http://kgbunshin.org/data/>

    SELECT ?resource ?label ?sameAs (COUNT(?place) AS ?placeCount)
    WHERE {
    ?place a ?o ;
        data:city ?resource.
        
    ?o rdfs:subClassOf kgb:Place ;
        rdfs:label ?categoryLabel .

    OPTIONAL {
        ?resource rdfs:label ?label ;
        owl:sameAs ?sameAs
    }

    }
    GROUP BY ?resource ?label ?sameAs
    ORDER BY DESC(?placeCount)
    LIMIT 10
`;

export const getAllCity = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX data: <http://kgbunshin.org/data/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX kgb: <http://kgbunshin.org/data/>

    SELECT ?resource
    WHERE { 
    ?resource a kgb:City ;
    }
    ORDER BY ASC(?resource)
`;

export const getAllCategory = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX data: <http://kgbunshin.org/data/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX kgb: <http://kgbunshin.org/data/>

    SELECT DISTINCT ?resource ?label
    WHERE { 
    ?place a ?resource .
        
    ?resource rdfs:subClassOf kgb:Place ;
        rdfs:label ?label
    }
    ORDER BY ASC(?resource)
`;

type Filters = {
  city?: string;
  category?: string;
  place?: string;
};

export function constructSearchPlacesQuery(filters: Filters): string {
  const { city, category, place } = filters;

  let query = `
        PREFIX : <http://kgbunshin.org/>
        PREFIX kgb: <http://kgbunshin.org/data/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?resource ?label ?category ?categoryLabel ?city ?ratingValue ?valuePrice ?valuePriceWeekday ?valuePriceWeekend ?sameAs
        WHERE {
            ?resource a ?category ;
                    rdfs:label ?label ;
                    kgb:city ?city ;
                    kgb:rating [a kgb:Rating ;
                                kgb:valueRating ?ratingValue] ;
            
            optional{
                    ?resource kgb:price [a kgb:Price ;
                        kgb:valuePriceWeekday ?valuePriceWeekday ;
                        kgb:valuePriceWeekend ?valuePriceWeekend].
            }

            optional{
                    ?resource kgb:price [a kgb:Price ;
                        kgb:valuePrice ?valuePrice].
            }

            optional{
                    ?resource owl:sameAs ?sameAs .
            }

            ?category rdfs:subClassOf kgb:Place ;
                rdfs:label ?categoryLabel .
    `;

  // Add optional filter for ?city
  if (city) {
    query += `
            FILTER(?city = <http://kgbunshin.org/data/${city}>)
        `;
  }

  // Add optional filter for ?category
  if (category) {
    query += `
            FILTER(?category = <http://kgbunshin.org/data/${category}>)
        `;
  }

  // Add optional filter for ?label
  if (place) {
    query += `
            FILTER(CONTAINS(LCASE(STR(?label)), LCASE("${place}")))
        `;
  }

  // Add optional city details
  query += `
        }
    `;

  return query;
}

export function getRDFGraph(resource: string) {
  const query = `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX kgb: <http://kgbunshin.org/data/>

  CONSTRUCT {
    kgb:${resource} ?p ?o .
    ?o ?p2 ?o2 .
    ?s ?p kgb:${resource} .
  }
  WHERE {
    { kgb:${resource} ?p ?o . 
          optional {
              ?o ?p2 ?o2
              FILTER(isBlank(?o))
          }
      }
    UNION
    { ?s ?p kgb:${resource} . }
  }
  `;

  return query;
}

export function constructPlaceEntityQueryWikiData(resource: string): string {
  let query = `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX kgb: <http://kgbunshin.org/data/>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX wdt: <http://www.wikidata.org/prop/direct/>
  PREFIX wd: <http://www.wikidata.org/entity/>
  PREFIX p: <http://www.wikidata.org/prop/>
  PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
  PREFIX ps: <http://www.wikidata.org/prop/statement/>

  SELECT ?placeName ?latitude ?longitude ?desc ?categoryLabel ?valRating 
        ?timeRating ?city ?cityName ?wikidataCityURI ?timePrice 
        ?priceGeneral ?priceWeekday ?priceWeekend ?wikidataPlaceURI 
        ?wdImageURL ?officialWebsite ?elevationAboveSeaLevel ?inceptionYear
        (GROUP_CONCAT(DISTINCT ?specificCategoryLabel; SEPARATOR=", ") AS ?aggregatedCategoryLabels)
        ?visitorNum (YEAR(?visitorTime) as ?visitorYear) ?timeSpent
  WHERE {
      kgb:${resource} rdfs:label ?placeName ;
          kgb:latitude ?latitude ;
          kgb:longitude ?longitude ;
          rdfs:comment ?desc ;
          a [ rdfs:label ?categoryLabel ] ;
          kgb:rating [ 
              kgb:valueRating ?valRating ; 
              kgb:pointInTime ?timeRating 
          ] ;
          kgb:city ?city ;
          kgb:price ?price .

      OPTIONAL { ?city rdfs:label ?cityName . }
      OPTIONAL { ?city owl:sameAs ?wikidataCityURI . }
      ?price kgb:pointInTime ?timePrice .
      OPTIONAL { ?price kgb:valuePrice ?priceGeneral . }
      OPTIONAL { ?price kgb:valuePriceWeekday ?priceWeekday . }
      OPTIONAL { ?price kgb:valuePriceWeekend ?priceWeekend . }
      OPTIONAL { kgb:${resource} kgb:timeSpent ?timeSpent }
      OPTIONAL { kgb:${resource} owl:sameAs ?wikidataPlaceURI . }

      # Query additional information from Wikidata if URI exists
      OPTIONAL {
          SERVICE <https://query.wikidata.org/sparql> {
              OPTIONAL { ?wikidataPlaceURI wdt:P18 ?wdImageURL . }
              OPTIONAL { 
                  ?wikidataPlaceURI p:P1174 ?visitorStatement .
                  ?visitorStatement ps:P1174 ?visitorNum ;
                                  pq:P585 ?visitorTime .   # Point in time
              }
              OPTIONAL { ?wikidataPlaceURI wdt:P856 ?officialWebsite . }
              OPTIONAL { ?wikidataPlaceURI wdt:P2044 ?elevationAboveSeaLevel . }
              OPTIONAL { ?wikidataPlaceURI wdt:P1571 ?inceptionTime . }
              OPTIONAL { 
                  ?wikidataPlaceURI wdt:P31 ?specificCategory .    # Instance of category
                  ?specificCategory rdfs:label ?specificCategoryLabel .  # Label for the category
                  FILTER(LANG(?specificCategoryLabel) = "id")  # Ensure the label is in English
              }
          }
      }
  }
  GROUP BY ?placeName ?latitude ?longitude ?desc ?categoryLabel ?valRating 
          ?timeRating ?city ?cityName ?wikidataCityURI ?timePrice 
          ?priceGeneral ?priceWeekday ?priceWeekend ?wikidataPlaceURI 
          ?wdImageURL ?officialWebsite ?elevationAboveSeaLevel ?inceptionYear
    ?visitorNum ?visitorTime ?timeSpent
`;

  return query;
}

export function constructPlaceEntityQuery(resource: string): string {
  let query = `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX kgb: <http://kgbunshin.org/data/>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX wdt: <http://www.wikidata.org/prop/direct/>
  PREFIX wd: <http://www.wikidata.org/entity/>
  PREFIX p: <http://www.wikidata.org/prop/>
  PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
  PREFIX ps: <http://www.wikidata.org/prop/statement/>

  SELECT ?placeName ?latitude ?longitude ?desc ?categoryLabel ?valRating 
        ?timeRating ?city ?cityName ?wikidataCityURI ?timePrice 
        ?priceGeneral ?priceWeekday ?priceWeekend ?wikidataPlaceURI ?timeSpent
  WHERE {
      kgb:${resource} rdfs:label ?placeName ;
          kgb:latitude ?latitude ;
          kgb:longitude ?longitude ;
          rdfs:comment ?desc ;
          a [ rdfs:label ?categoryLabel ] ;
          kgb:rating [ 
              kgb:valueRating ?valRating ; 
              kgb:pointInTime ?timeRating 
          ] ;
          kgb:city ?city ;
          kgb:price ?price .

      OPTIONAL { ?city rdfs:label ?cityName . }
      OPTIONAL { ?city owl:sameAs ?wikidataCityURI . }
      ?price kgb:pointInTime ?timePrice .
      OPTIONAL { ?price kgb:valuePrice ?priceGeneral . }
      OPTIONAL { ?price kgb:valuePriceWeekday ?priceWeekday . }
      OPTIONAL { ?price kgb:valuePriceWeekend ?priceWeekend . }
      OPTIONAL { kgb:${resource} kgb:timeSpent ?timeSpent }
      OPTIONAL { kgb:${resource} owl:sameAs ?wikidataPlaceURI }
  }
`;

  return query;
}

export function constructPlaceHasSameAsQuery(resource: string): string {
  let query = `
  PREFIX kgb: <http://kgbunshin.org/data/>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  SELECT (IF(EXISTS { kgb:${resource} owl:sameAs ?sameAs }, true, false) AS ?hasSameAs)
  WHERE {}
`;

  return query;
}
