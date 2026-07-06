import { MapPin, Users, Clock, Star, AlertCircle, CheckCircle } from 'lucide-react';
import type { Venue, TimeSlot } from '../App';

type RecommendationListProps = {
  venues: Venue[];
  weather: { condition: 'sunny' | 'cloudy' | 'rainy', temp: number } | null;
  commonTimeSlots: TimeSlot[];
};

export function RecommendationList({ venues, weather, commonTimeSlots }: RecommendationListProps) {
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isVenueOpenDuringCommonTime = (venue: Venue) => {
    if (commonTimeSlots.length === 0) return true;

    const commonStart = timeToMinutes(commonTimeSlots[0].start);
    const commonEnd = timeToMinutes(commonTimeSlots[0].end);
    const venueStart = timeToMinutes(venue.openingHours.start);
    const venueEnd = timeToMinutes(venue.openingHours.end);

    return venueStart <= commonStart && venueEnd >= commonEnd;
  };
  const getCrowdLevelText = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return '空いている';
      case 'medium': return '普通';
      case 'high': return '混雑';
    }
  };

  const getCrowdLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">おすすめの場所</h3>

      {weather?.condition === 'rainy' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-blue-800">
            雨が予想されるため、屋内の施設を中心に表示しています
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map(venue => {
          const isOpenDuringCommonTime = isVenueOpenDuringCommonTime(venue);

          return (
            <div
              key={venue.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow bg-white ${
                isOpenDuringCommonTime ? 'border-gray-200' : 'border-gray-300 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{venue.name}</h4>
                  <p className="text-sm text-gray-600">{venue.category}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">{venue.rating}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    営業時間: {venue.openingHours.start} - {venue.openingHours.end}
                  </span>
                </div>

                {isOpenDuringCommonTime ? (
                  <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">空き時間に営業中</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">営業時間外の可能性</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm px-2 py-1 rounded ${getCrowdLevelColor(venue.crowdLevel)}`}>
                    {getCrowdLevelText(venue.crowdLevel)}
                  </span>
                </div>

                {venue.requiresReservation && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">予約必須</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {venue.indoor ? '屋内' : '屋外'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
