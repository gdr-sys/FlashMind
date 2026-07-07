/**
 * StatsView — Global statistics and progress tracking.
 */
import {
  BarChart3,
  BookOpen,
  Layers,
  Brain,
  Target,
  Flame,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StatsView() {
  const { decks, sessions, t } = useApp();

  // Calculate global stats
  const allCards = decks.flatMap((d) => d.cards);
  const totalCards = allCards.length;
  const totalDecks = decks.length;
  const totalSessions = sessions.length;

  const newCards = allCards.filter((c) => c.sr.stage === 0).length;
  const learningCards = allCards.filter((c) => c.sr.stage === 1).length;
  const reviewCards = allCards.filter((c) => c.sr.stage === 2).length;
  const masteredCards = allCards.filter((c) => c.sr.stage === 3).length;

  // Average accuracy from sessions
  const avgAccuracy = sessions.length > 0
    ? Math.round(
        sessions.reduce((acc, s) => {
          const total = s.correct + s.hard + s.forgot;
          return acc + (total > 0 ? ((s.correct + s.hard * 0.5) / total) * 100 : 0);
        }, 0) / sessions.length
      )
    : 0;

  // Total cards studied
  const totalStudied = sessions.reduce((acc, s) => acc + s.cardsStudied, 0);

  // Study streak (consecutive days with sessions)
  const getStreak = () => {
    if (sessions.length === 0) return 0;

    const days = new Set(
      sessions.map((s) => new Date(s.startedAt).toDateString())
    );
    const sortedDays = Array.from(days)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      expected.setHours(0, 0, 0, 0);

      const dayDate = new Date(sortedDays[i]);
      dayDate.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  // Stage distribution bar
  const stageBar = totalCards > 0 ? (
    <div className="mb-6">
      <div className="flex rounded-full overflow-hidden h-4 bg-slate-100 dark:bg-slate-700">
        {newCards > 0 && (
          <div
            className="bg-slate-400 transition-all"
            style={{ width: `${(newCards / totalCards) * 100}%` }}
            title={`${t('newCards')}: ${newCards}`}
          />
        )}
        {learningCards > 0 && (
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${(learningCards / totalCards) * 100}%` }}
            title={`${t('learningCards')}: ${learningCards}`}
          />
        )}
        {reviewCards > 0 && (
          <div
            className="bg-blue-400 transition-all"
            style={{ width: `${(reviewCards / totalCards) * 100}%` }}
            title={`${t('reviewCards')}: ${reviewCards}`}
          />
        )}
        {masteredCards > 0 && (
          <div
            className="bg-emerald-400 transition-all"
            style={{ width: `${(masteredCards / totalCards) * 100}%` }}
            title={`${t('masteredCards')}: ${masteredCards}`}
          />
        )}
      </div>
      <div className="flex flex-wrap justify-between mt-2 text-[10px] text-slate-400 gap-x-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> {t('newCards')} ({newCards})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> {t('learningCards')} ({learningCards})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> {t('reviewCards')} ({reviewCards})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> {t('masteredCards')} ({masteredCards})
        </span>
      </div>
    </div>
  ) : null;

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <BarChart3 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {t('stats')}
          </h1>
        </div>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Layers} label={t('totalDecks')} value={totalDecks} color="indigo" />
        <StatCard icon={BookOpen} label={t('totalCards')} value={totalCards} color="blue" />
        <StatCard icon={Brain} label={t('studySessions')} value={totalSessions} color="purple" />
        <StatCard icon={Target} label={t('averageAccuracy')} value={`${avgAccuracy}%`} color="emerald" />
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 mb-6 flex items-center gap-4 text-white shadow-lg shadow-orange-500/20">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
          <Flame size={28} />
        </div>
        <div>
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-sm opacity-80">{t('studyStreak')} ({t('days')})</p>
        </div>
      </div>

      {/* Stage distribution */}
      {totalCards > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Card Progress
          </h3>
          {stageBar}
        </div>
      )}

      {/* Detailed stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Details
          </h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
          <DetailRow icon={TrendingUp} label="Total Cards Studied" value={totalStudied} />
          <DetailRow icon={Award} label={t('masteredCards')} value={masteredCards} />
          <DetailRow
            icon={Target}
            label={t('averageAccuracy')}
            value={`${avgAccuracy}%`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Layers;
  label: string;
  value: string | number;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  };
  const iconColorMap: Record<string, string> = {
    indigo: 'text-indigo-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    emerald: 'text-emerald-500',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
      <div className={`w-9 h-9 rounded-lg ${bgMap[color]} flex items-center justify-center mb-2`}>
        <Icon size={18} className={iconColorMap[color]} />
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={16} className="text-slate-400 shrink-0" />
      <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}
