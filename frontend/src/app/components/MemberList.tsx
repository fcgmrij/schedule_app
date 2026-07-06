import { Users, X } from 'lucide-react';
import type { Member } from '../App';

type MemberListProps = {
  members: Member[];
  onDeleteMember: (id: string) => void;
};

export function MemberList({ members, onDeleteMember }: MemberListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">メンバー</h2>
      </div>

      <div className="space-y-3">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: member.color }}
            >
              {member.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">
                {member.schedule.filter(s => s.available).length}日間参加可能
              </p>
            </div>
            <button
              onClick={() => onDeleteMember(member.id)}
              className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
