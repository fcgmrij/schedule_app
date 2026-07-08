import { useState, useMemo, useEffect } from 'react';
import { Calendar, Cloud, CloudRain, Sun, Users, MapPin, Clock, User } from 'lucide-react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { RecommendationList } from './components/RecommendationList';
import { MemberList } from './components/MemberList';
import venuesJson from './data/venues.json';
import {
  TimeSlot,
  Member,
  Venue,
  DbSchedule,
} from "./types";

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [members, setMembers] =useState<Member[]>([]);
  const [dbSchedules, setDbSchedules] = useState<DbSchedule[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/user/list`)
      .then((res) => res.json())
      .then((data) => {
        const members = data.map((user: any) => ({
          id: String(user.id),
          name: user.name,
          color: "#3b82f6",
          schedule: [],
        }));

        setMembers(members);
      })
      .catch((error) => {
        console.error("メンバー取得失敗", error);
      });
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/schedule/get/1`);
      const data = await res.json();
      setDbSchedules(data);
    } catch (error) {
      console.error("予定取得失敗", error);
    }
  };
  useEffect(() => {
    fetchSchedules();
  }, []);


  const [newMemberName, setNewMemberName] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  useEffect(() => {
    if (!selectedMemberId) return;
    fetch(`${API_URL}/api/schedule/get/${selectedMemberId}`)
      .then((res) => res.json())
      .then((data) => {
        const convertedSchedules = data.map((schedule: DbSchedule) => ({
          id: schedule.id,
          date: schedule.date.slice(0, 10),
          available: true,
          timeSlots: [
            {
              start: schedule.start_time,
              end: schedule.end_time,
            },
          ],
        }));
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMemberId
              ? {
                  ...member,
                  schedule: convertedSchedules,
                }
              : member
          )
        );
      })
      .catch((error) => {
        console.error("選択メンバーの予定取得失敗", error);
      });
  }, [selectedMemberId]);

  const [memberDate, setMemberDate] = useState("");

  const [memberStartTime, setMemberStartTime] = useState("");
  const [memberEndTime, setMemberEndTime] = useState("");
  
  const [scheduleName, setScheduleName] = useState("");

  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);

  const [venues, setVenues] = useState<Venue[]>(venuesJson as Venue[]);


  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;
    const colors = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f97316"];
    await fetch(`${API_URL}/api/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: newMemberName,
        user_email: `${newMemberName}@example.com`,
      }),
    });
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: newMemberName,
      color: colors[members.length % colors.length],
      schedule: [
        {
          date: memberDate,
          available: true,
          timeSlots: [
            {
              start: memberStartTime,
              end: memberEndTime,
            },
          ],
        },
      ],
    };
    setMembers([...members, newMember]);
    setNewMemberName("");
  };

  const handleDeleteMember = async (id: string) => {
    await fetch(`${API_URL}/api/user/delete?user_id=${id}`, {
      method: "DELETE",
    });

    setMembers(members.filter(member => member.id !== id));
  };

  const selectedMember = members.find(
    member => member.id === selectedMemberId
  );

  const handleAddSchedule = async () => {
    if (!selectedMemberId || !scheduleName || !memberDate || !memberStartTime || !memberEndTime) {
      alert("空いている日付と時間帯を入力してください");
      return;
    }
    await fetch(`${API_URL}/api/schedule/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: Number(selectedMemberId),
        schedule_name: scheduleName,
        schedule_date: memberDate,
        start_time: memberStartTime,
        end_time: memberEndTime,
      }),
    });
    await fetchSchedules();

    setMembers(
      members.map(member => {
        if (member.id !== selectedMemberId) return member;
        const newSchedule = {
          date: memberDate,
          available: true,
          timeSlots: [
            {
              start: memberStartTime,
              end: memberEndTime,
            },
          ],
        };
        if (editingScheduleIndex !== null) {
          return {
            ...member,
            schedule: member.schedule.map((schedule, index) =>
              index === editingScheduleIndex ? newSchedule : schedule
            ),
          };
        }
        return {
          ...member,
          schedule: [...member.schedule, newSchedule],
        };
      })
    );
    setEditingScheduleIndex(null);
    setMemberDate("");
    setMemberStartTime("");
    setMemberEndTime("");
    setScheduleName("");
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    await fetch(`${API_URL}/api/schedule/delete?schedule_id=${scheduleId}`, {
      method: "DELETE",
    });

    await fetchSchedules();

    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === selectedMemberId
          ? {
              ...member,
              schedule: member.schedule.filter((schedule) => schedule.id !== scheduleId),
            }
          : member
      )
    );
  };

  const handleStartEditSchedule = (index: number) => {
    if (!selectedMember) return;
    const schedule = selectedMember.schedule[index];
    setMemberDate(schedule.date);
    setMemberStartTime(schedule.timeSlots?.[0]?.start || "");
    setMemberEndTime(schedule.timeSlots?.[0]?.end || "");
    setEditingScheduleIndex(index);
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<

  Record<string, { condition: 'sunny' | 'cloudy' | 'rainy'; temp: number | null }>>({});

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        console.log("天気取得開始");
        const response = await fetch(
          "https://www.jma.go.jp/bosai/forecast/data/forecast/460100.json"
        );
        const data = await response.json();

        console.log(data[0].timeSeries[0].timeDefines);
        console.log(data[0].timeSeries[0].areas[0].weathers);

        const timeDefines = data[0].timeSeries[0].timeDefines;
        const weathers = data[0].timeSeries[0].areas[0].weathers;

        const tempDates = data[1].timeSeries[1].timeDefines;
        const tempsMax = data[1].timeSeries[1].areas[0].tempsMax;

        console.log("tempDates", tempDates);
        console.log("tempsMax", tempsMax);

        const weatherMap: Record<
          string,
          {
            condition: "sunny" | "cloudy" | "rainy";
            temp: number | null;
          }
        > = {};
        timeDefines.forEach((date: string, index: number) => {
          const weatherText = weathers[index];
          let condition: "sunny" | "cloudy" | "rainy" = "cloudy";
          if (weatherText.includes("晴")) {
            condition = "sunny";
          } else if (weatherText.includes("雨")) {
            condition = "rainy";
          }
          const dateKey = date.slice(0, 10);
          const tempIndex = tempDates.findIndex(
            (d: string) => d.slice(0, 10) === dateKey
          );

          const temp =
            tempIndex >= 0 && tempsMax[tempIndex] !== ""
              ? Number(tempsMax[tempIndex])
              : null;
          
          console.log("dateKey", dateKey, "tempIndex", tempIndex);
          console.log("temp", temp);
        
          weatherMap[dateKey] = {
            condition,
            temp,
          };
        });
        console.log(weatherMap);
        setWeatherData(weatherMap);

        console.log("気象庁データ", data);
      } catch (error) {
        console.error("天気取得失敗", error);
      }
    };
    fetchWeather();
  }, []);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    if (members.length === 0) return [];
    const firstMemberSchedule = members[0].schedule;
    for (const dateEntry of firstMemberSchedule) {
      const allAvailable = members.every(member =>
        member.schedule.some(s => s.date === dateEntry.date && s.available)
      );
      if (allAvailable) {
        dates.add(dateEntry.date);
      }
    }
    return Array.from(dates).sort();
  }, [members]);
  const commonTimeSlots = useMemo(() => {
    if (!selectedDate || members.length === 0) return [];
    const memberSchedules = members
      .map(m => m.schedule.find(s => s.date === selectedDate && s.available))
      .filter(s => s && s.timeSlots);
    if (memberSchedules.length !== members.length) return [];
    const allTimeSlots = memberSchedules.flatMap(s => s!.timeSlots || []);
    if (allTimeSlots.length === 0) return [];
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const latestStart = Math.max(...allTimeSlots.map(t => timeToMinutes(t.start)));
    const earliestEnd = Math.min(...allTimeSlots.map(t => timeToMinutes(t.end)));

    if (latestStart >= earliestEnd) return [];

    return [{ start: minutesToTime(latestStart), end: minutesToTime(earliestEnd) }];
  }, [selectedDate, members]);

  const recommendedVenues = useMemo(() => {
    if (!selectedDate) return [];

    const weather = weatherData[selectedDate];
    if (!weather) return venues;;

    const filtered = venues.filter(venue => {
      if (weather.condition === 'rainy' && !venue.indoor) {
        return false;
      }
      return true;
    });
    return filtered.sort((a, b) => b.rating - a.rating);

  }, [selectedDate, weatherData, venues]);

  const reservationPerson = useMemo(() => {
    if (!selectedDate || recommendedVenues.length === 0) return null;

    const needsReservation = recommendedVenues.some(v => v.requiresReservation);
    if (!needsReservation) return null;

    const randomIndex = Math.floor(Math.random() * members.length);
    return members[randomIndex];
  }, [selectedDate, recommendedVenues, members]);

  const weatherIcon = selectedDate && weatherData[selectedDate] ? (
    weatherData[selectedDate].condition === 'sunny' ? <Sun className="w-5 h-5 text-yellow-500" /> :
    weatherData[selectedDate].condition === 'cloudy' ? <Cloud className="w-5 h-5 text-gray-400" /> :
    <CloudRain className="w-5 h-5 text-blue-500" />
  ) : null;

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="bg-white rounded-lg shadow-sm p-6">

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-2">DBから取得した予定</h2>
            {dbSchedules.map((schedule) => (
              <div key={schedule.id} className="text-sm text-gray-700">
                {schedule.name}：{schedule.date.slice(0, 10)}
              </div>
            ))}
          </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メンバー追加
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="例：山田"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />

              <button
                onClick={handleAddMember}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                追加
              </button>
            </div>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">メンバーを選択</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <input
              type="text"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="予定名（例：サッカー）"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            />
            <input
              type="date"
              value={memberDate}
              onChange={(e) => setMemberDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={memberStartTime}
              onChange={(e) => setMemberStartTime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={memberEndTime}
              onChange={(e) => setMemberEndTime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="mt-3">
            <button
              onClick={handleAddSchedule}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              予定を追加
            </button>
          </div>

          {selectedMember && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                {selectedMember.name}の空き時間一覧
              </h3>

              {selectedMember.schedule.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  まだ空き時間が登録されていません。
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMember.schedule.map((schedule, index) => (
                    <div
                      key={`${schedule.date}-${index}`}
                      className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-gray-700">
                        {schedule.date}
                        {schedule.timeSlots?.[0] &&
                          ` ${schedule.timeSlots[0].start}〜${schedule.timeSlots[0].end}`}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEditSchedule(index)}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          変更
                        </button>
                        <button
                          onClick={() => {
                            if (schedule.id) {
                              handleDeleteSchedule(schedule.id);
                            }
                          }}
                          className="text-red-600 text-sm hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">予定調整アプリ</h1>
              <p className="text-gray-600 mt-1">友人との予定を簡単に調整して、おすすめの場所を見つけよう</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MemberList
              members={members}
              onDeleteMember={handleDeleteMember}
            />          
          </div>
          <div className="lg:col-span-2">
            <ScheduleCalendar
              members={members}
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setMemberDate(date);
              }}
              weatherData={weatherData}
              commonTimeSlots={commonTimeSlots}
            />
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">選択された日時</h2>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-lg text-gray-700">{selectedDate}</p>
                  <div className="flex items-center gap-2">
                    {weatherIcon}
                    <span className="text-gray-600">
                      {weatherData[selectedDate]?.temp}°C
                    </span>
                  </div>
                </div>
                {commonTimeSlots.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      全員が空いている時間: {commonTimeSlots[0].start} - {commonTimeSlots[0].end}
                    </span>
                  </div>
                )}
              </div>

              {reservationPerson && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium">予約担当</p>
                      <p className="font-bold">{reservationPerson.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <RecommendationList
              venues={recommendedVenues}
              weather={selectedDate ? weatherData[selectedDate] : null}
              commonTimeSlots={commonTimeSlots}
            />
          </div>
        )}

        {!selectedDate && availableDates.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-blue-900">全員が参加可能な日</h3>
                <p className="text-blue-700 mt-1">
                  {availableDates.length}日が見つかりました。カレンダーから日付を選択してください。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}