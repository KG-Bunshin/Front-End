interface InfoboxProps {
  placeName?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  categoryLabel?: string;
  rating?: string;
  ratingDate?: string;
  cityName?: string;
  wikidataCityURI?: string;
  timePrice?: string;
  priceGeneral?: number;
  priceWeekday?: number;
  priceWeekend?: number;
  wikidataPlaceURI?: string;
  imageUrl?: string;
  officialWebsite?: string;
  categories?: string;
  visitors?: string;
  visitorYear?: string;
  timeSpent?: string;
}

const Infobox: React.FC<InfoboxProps> = ({
  placeName,
  latitude,
  longitude,
  description,
  categoryLabel,
  rating,
  ratingDate,
  cityName,
  wikidataCityURI,
  timePrice,
  priceGeneral,
  priceWeekday,
  priceWeekend,
  wikidataPlaceURI,
  imageUrl,
  officialWebsite,
  categories,
  visitors,
  visitorYear,
  timeSpent,
}) => {
  const googleMapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.MAP_KEY}&q=${latitude},${longitude}&zoom=15`;

  return (
    <div className="max-w-xl mx-auto bg-white border rounded-lg shadow-md p-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={placeName}
          className="w-full h-60 object-cover rounded-md"
        />
      )}
      {placeName && <h2 className="text-xl font-semibold mt-4">{placeName}</h2>}
      {description && (
        <p className="text-sm text-gray-600 mb-2">{description}</p>
      )}
      <div className="flex flex-wrap gap-4">
        {latitude && longitude && (
          <div className="w-full">
            <h3 className="font-medium text-gray-700">Lokasi</h3>
            <p className="text-sm">
              Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
            </p>
          </div>
        )}
        {categoryLabel && (
          <div className="w-full">
            <h3 className="font-medium text-gray-700">Kategori</h3>
            <p className="text-sm">{categoryLabel}</p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-medium text-gray-700">Details</h3>
        <ul className="list-disc list-inside text-sm">
          {rating && (
            <li>
              Rating: {rating} (Diperbarui:{' '}
              {ratingDate && new Date(ratingDate).toLocaleDateString()})
            </li>
          )}
          {cityName && (
            <li>
              Kota:{' '}
              {wikidataCityURI ? (
                <a href={wikidataCityURI} className="text-blue-500 underline">
                  {cityName}
                </a>
              ) : (
                <p>{cityName}</p>
              )}
            </li>
          )}
          {priceGeneral != undefined && (
            <li>
              Harga:
              {priceGeneral == 0
                ? ' Gratis'
                : ' Rp ' + priceGeneral.toLocaleString()}{' '}
              (Diperbarui:{' '}
              {timePrice && new Date(timePrice).toLocaleDateString()})
            </li>
          )}
          {priceWeekday != undefined && (
            <li>
              Harga Weekday :
              {priceWeekday == 0
                ? ' Gratis'
                : ' Rp ' + priceWeekday.toLocaleString()}{' '}
              (Diperbarui:{' '}
              {timePrice && new Date(timePrice).toLocaleDateString()})
            </li>
          )}
          {priceWeekend != undefined && (
            <li>
              Harga Weekend :
              {priceWeekend == 0
                ? ' Gratis'
                : ' Rp ' + priceWeekend.toLocaleString()}{' '}
              (Diperbarui:{' '}
              {timePrice && new Date(timePrice).toLocaleDateString()})
            </li>
          )}
          {timeSpent && (
            <li>Rata-rata waktu yang dihabiskan: {timeSpent} menit</li>
          )}
          {visitorYear && visitors && (
            <li>
              Jumlah Pengunjung (Tahun {visitorYear}):{' '}
              {visitors.toLocaleString()}
            </li>
          )}
        </ul>
      </div>
      {latitude && longitude && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700">Google Map</h3>
          <div className="w-full h-64">
            <iframe
              src={googleMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
      {(wikidataPlaceURI || officialWebsite) && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700">Links</h3>
          <ul className="list-none text-sm">
            {wikidataPlaceURI && (
              <li>
                <a href={wikidataPlaceURI} className="text-blue-500 underline">
                  Wikidata
                </a>
              </li>
            )}
            {officialWebsite && (
              <li>
                <a href={officialWebsite} className="text-blue-500 underline">
                  Official Website
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
      {categories && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700">Kategori Spesifik</h3>
          <p className="text-sm">{categories}</p>
        </div>
      )}
    </div>
  );
};

export default Infobox;
