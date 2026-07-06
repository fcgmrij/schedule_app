import { useState, useMemo } from 'react';
import { Calendar, Sun, Cloud, CloudRain, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Member, TimeSlot } from '../App';

type ScheduleCalendarProps = {
  members: Member[];
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  weatherData: Record<string, { condition: 'sunny' | 'cloudy' | 'rainy', temp: number }>;
  commonTimeSlots: TimeSlot[];
};

export function ScheduleCalendar({
  members,
  availableDates,
  selectedDate,
  onSelectDate,
  weatherData,
  commonTimeSlots
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));

  const allDates = useMemo(() => {
    return Array.from(
      new Set(members.flatMap(m => m.schedule.map(s => s.date)))
    ).sort();
  }, [members]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getMemberAvailability = (date: string) => {
    return members.map(member => {
      const schedule = member.schedule.find(s => s.date === date);
      return {
        member,
        available: schedule?.available ?? false,
        timeSlots: schedule?.timeSlots || []
      };
    });
  };

  const isAvailableForAll = (date: string) => {
    return availableDates.includes(date);
  };

  const getWeatherIcon = (date: string, size: 'sm' | 'xs' = 'sm') => {
    const weather = weatherData[date];
    if (!weather) return null;

    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-3 h-3';

    if (weather.condition === 'sunny') {
      return <Sun className={`${iconSize} text-yellow-500`} />;
    } else if (weather.condition === 'cloudy') {
      return <Cloud className={`${iconSize} text-gray-400`} />;
    } else {
      return <CloudRain className={`${iconSize} text-blue-500`} />;
    }
  };

  const hasScheduleData = (dateStr: string) => {
    return allDates.includes(dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">スケジュール</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg min-w-[120px] text-center">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-bold py-2 text-sm ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasData = hasScheduleData(dateStr);
          const allAvailable = isAvailableForAll(dateStr);
          const isSelected = selectedDate === dateStr;
          const memberAvailability = getMemberAvailability(dateStr);
          const dayOfWeek = day.getDay();

          return (
            <button
              key={dateStr}
              onClick={() => hasData && onSelectDate(dateStr)}
              disabled={!hasData}
              className={`min-h-[100px] p-2 border rounded-lg transition-all ${
                !isCurrentMonth
                  ? 'bg-gray-50 opacity-40'
                  : isSelected
                  ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                  : allAvailable
                  ? 'border-2 border-green-400 bg-green-50 hover:shadow-sm'
                  : hasData
                  ? 'border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  : 'border border-gray-200 cursor-default'
              } ${!hasData && isCurrentMonth ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-bold ${
                    dayOfWeek === 0
                      ? 'text-red-600'
                      : dayOfWeek === 6
                      ? 'text-blue-600'
                      : isSelected
                      ? 'text-blue-700'
                      : 'text-gray-900'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-col items-end gap-1">
                  {getWeatherIcon(dateStr, 'xs')}

                  {weatherData[dateStr]?.temp !== null &&
                    weatherData[dateStr]?.temp !== undefined && (
                      <span className="text-[11px] font-bold text-red-600">
                        {weatherData[dateStr]?.temp}℃
                      </span>
                    )}
                </div>
              </div>
              {hasData && (
                <div className="space-y-1">
                  {memberAvailability.map(({ member, available, timeSlots }) => (
                    <div
                      key={member.id}
                      className={`h-6 rounded flex items-center justify-center ${
                        available ? 'opacity-100' : 'opacity-30'
                      }`}
                      style={{ backgroundColor: member.color }}
                      title={`${member.name}: ${available ? `${timeSlots[0]?.start || ''}〜` : '不可'}`}
                    >
                      {available && timeSlots.length > 0 && (
                        <span className="text-xs text-white font-medium">
                          {timeSlots[0].start}〜
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
            <span className="text-gray-600">全員参加可能</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-300 rounded"></div>
            <span className="text-gray-600">一部参加可能</span>
          </div>
        </div>
      </div>
    </div>
  );
}
