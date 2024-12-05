import React from 'react';
import { Badge } from './ui/badge';

interface CustomCardProps {
  imageUrl?: string;
  category: string;
  title: string;
  city: string;
  ratingValue: string;
  price?: string;
  onButtonClick?: () => void; // Optional callback for the button
}

const CustomCard: React.FC<CustomCardProps> = ({
  imageUrl = 'https://via.placeholder.com/400x300',
  category,
  title,
  city,
  ratingValue,
  price,
  onButtonClick,
}) => {
  return (
    <div className="w-full mx-auto bg-white shadow-md rounded-lg overflow-hidden h-fit flex flex-col">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{city}</p>
        <div className="flex items-center mt-3">
          <span className="text-blue-500 font-semibold text-sm">
            <Badge className="bg-yellow-500 text-white">
              {ratingValue} / 5.0
            </Badge>
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-red-500 text-lg font-bold ml-2">{price}</span>
          </div>
          <button
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600"
            onClick={onButtonClick}
          >
            Lihat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomCard;
