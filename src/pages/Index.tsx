import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { INSECTS, ORDERS, type Insect } from '@/data/insects';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/888e6ceb-92a0-4237-a1ec-a0c07d77b40f/files/ae53a0f0-9cfb-45d5-9a69-a75b115430eb.jpg';

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'taxonomy', label: 'Классификация' },
  { id: 'profile', label: 'Профиль' },
  { id: 'farm', label: 'Монетизация' },
  { id: 'contacts', label: 'Контакты' },
];

const rarityColor: Record<string, string> = {
  'Обычный': 'text-muted-foreground border-border',
  'Редкий': 'text-accent border-accent',
  'Эндемик': 'text-destructive border-destructive',
};

const Index = () => {
  const { toast } = useToast();
  const [credits, setCredits] = useState(80);
  const [unlocked, setUnlocked] = useState<string[]>(['apis']);
  const [section, setSection] = useState('home');
  const [filter, setFilter] = useState('Все отряды');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Insect | null>(null);
  const [globalUnlocks, setGlobalUnlocks] = useState(1284);
  const [livePulse, setLivePulse] = useState(false);
  const [lastHarvest, setLastHarvest] = useState<number | null>(() => {
    const v = localStorage.getItem('ento_last_harvest');
    return v ? Number(v) : null;
  });
  const [lastReward, setLastReward] = useState<number | null>(() => {
    const v = localStorage.getItem('ento_last_reward');
    return v ? Number(v) : null;
  });

  // Real-time global unlock activity simulation
  useEffect(() => {
    const t = setInterval(() => {
      setGlobalUnlocks((n) => n + Math.floor(Math.random() * 3) + 1);
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 400);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(
    () =>
      INSECTS.filter(
        (i) =>
          (filter === 'Все отряды' || i.order === filter) &&
          (i.commonName.toLowerCase().includes(search.toLowerCase()) ||
            i.latin.toLowerCase().includes(search.toLowerCase()))
      ),
    [filter, search]
  );

  const progress = Math.round((unlocked.length / INSECTS.length) * 100);

  const handleUnlock = (insect: Insect) => {
    if (unlocked.includes(insect.id)) {
      setActive(insect);
      return;
    }
    if (credits < insect.cost) {
      toast({
        title: 'Недостаточно кредитов',
        description: `Нужно ${insect.cost} кр. Пополните баланс в Магазине.`,
      });
      return;
    }
    setCredits((c) => c - insect.cost);
    setUnlocked((u) => [...u, insect.id]);
    setGlobalUnlocks((n) => n + 1);
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 400);
    toast({
      title: 'Карточка разблокирована',
      description: `${insect.commonName} добавлен в вашу коллекцию.`,
    });
    setActive(insect);
  };

  const DAY_MS = 24 * 60 * 60 * 1000;
  const canHarvest = !lastHarvest || Date.now() - lastHarvest >= DAY_MS;

  const harvest = () => {
    if (!canHarvest) return;
    const reward = Math.floor(Math.random() * 101); // 0..100
    const now = Date.now();
    setCredits((c) => c + reward);
    setLastHarvest(now);
    setLastReward(reward);
    localStorage.setItem('ento_last_harvest', String(now));
    localStorage.setItem('ento_last_reward', String(reward));
    toast({
      title: reward > 0 ? 'Урожай собран!' : 'Сегодня пусто',
      description:
        reward > 0
          ? `Ферма принесла ${reward} кредитов.`
          : 'Насекомые отдыхали. Загляните завтра!',
    });
  };

  const goto = (id: string) => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => goto('home')}
            className="flex items-center gap-2"
          >
            <Icon name="Bug" size={26} className="text-accent" />
            <span className="font-display text-2xl font-700 tracking-tight">
              Entomologia
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => goto(n.id)}
                className={`text-sm font-sans tracking-wide transition-colors hover:text-accent ${
                  section === n.id
                    ? 'text-accent border-b border-accent pb-1'
                    : 'text-foreground/70'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 border border-accent/40 rounded-sm px-3 py-1.5 bg-secondary">
            <Icon name="Coins" size={16} className="text-accent" />
            <span className="font-sans text-sm font-600 tabular-nums">
              {credits}
            </span>
            <span className="text-xs text-muted-foreground">кр.</span>
          </div>
        </div>
        {/* mobile nav */}
        <div className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-4 px-4 py-2 whitespace-nowrap">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => goto(n.id)}
                className={`text-xs font-sans ${
                  section === n.id ? 'text-accent' : 'text-foreground/60'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Live ticker */}
      <div className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex items-center gap-3 py-2 text-xs font-sans">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            В реальном времени
          </span>
          <span className="opacity-80">
            Исследователи разблокировали{' '}
            <span
              className={`tabular-nums font-600 ${
                livePulse ? 'animate-count-pulse text-accent' : 'text-accent'
              }`}
            >
              {globalUnlocks.toLocaleString('ru')}
            </span>{' '}
            карточек
          </span>
        </div>
      </div>

      <main className="container py-12">
        {section === 'home' && (
          <Home goto={goto} progress={progress} unlocked={unlocked.length} />
        )}

        {section === 'catalog' && (
          <section className="animate-fade-in">
            <SectionTitle
              kicker="Catalogus"
              title="Каталог насекомых"
              sub="Разблокируйте карточки за кредиты и откройте подробные научные описания."
            />
            <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl">
              <div className="relative flex-1">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Поиск по названию или латыни…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border rounded-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ORDERS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setFilter(o)}
                    className={`text-xs font-sans px-3 py-2 rounded-sm border transition-colors ${
                      filter === o
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-foreground/70 hover:border-accent'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((insect) => {
                const isOpen = unlocked.includes(insect.id);
                return (
                  <article
                    key={insect.id}
                    className="group relative border border-border bg-card rounded-sm overflow-hidden flex flex-col animate-scale-in"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 deco-rule opacity-60" />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <span
                          className={`text-6xl transition-all duration-500 ${
                            isOpen
                              ? ''
                              : 'grayscale blur-[3px] opacity-50'
                          }`}
                        >
                          {insect.emoji}
                        </span>
                        <span
                          className={`text-[10px] font-sans uppercase tracking-widest border px-2 py-0.5 rounded-sm ${rarityColor[insect.rarity]}`}
                        >
                          {insect.rarity}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-600 leading-tight">
                        {insect.commonName}
                      </h3>
                      <p className="italic text-sm text-muted-foreground mb-1">
                        {insect.latin}
                      </p>
                      <p className="text-xs font-sans text-accent uppercase tracking-wide mb-4">
                        {insect.order} · {insect.family}
                      </p>
                      <p className="text-sm text-foreground/70 flex-1">
                        {isOpen ? insect.description.slice(0, 90) + '…' : insect.shortHint}
                      </p>
                    </div>
                    <div className="border-t border-border p-4">
                      <Button
                        onClick={() => handleUnlock(insect)}
                        variant={isOpen ? 'secondary' : 'default'}
                        className="w-full rounded-sm font-sans"
                      >
                        {isOpen ? (
                          <>
                            <Icon name="BookOpen" size={15} className="mr-2" />
                            Читать описание
                          </>
                        ) : (
                          <>
                            <Icon name="Lock" size={15} className="mr-2" />
                            Открыть · {insect.cost} кр.
                          </>
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-16 italic">
                Ничего не найдено в этом отряде.
              </p>
            )}
          </section>
        )}

        {section === 'taxonomy' && <Taxonomy />}

        {section === 'profile' && (
          <Profile
            credits={credits}
            unlocked={unlocked}
            progress={progress}
            goto={goto}
          />
        )}

        {section === 'farm' && (
          <Farm
            canHarvest={canHarvest}
            onHarvest={harvest}
            lastHarvest={lastHarvest}
            lastReward={lastReward}
          />
        )}

        {section === 'contacts' && <Contacts toast={toast} />}
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="container py-10 flex flex-col md:flex-row justify-between gap-6 text-sm font-sans text-muted-foreground">
          <div>
            <p className="font-display text-xl text-foreground mb-1">
              Entomologia
            </p>
            <p>Академическая энциклопедия насекомых · 2026</p>
          </div>
          <div className="flex gap-8">
            {NAV.slice(0, 4).map((n) => (
              <button
                key={n.id}
                onClick={() => goto(n.id)}
                className="hover:text-accent"
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* Detail modal */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{active.emoji}</span>
                  <div>
                    <DialogTitle className="font-display text-3xl font-600 text-left">
                      {active.commonName}
                    </DialogTitle>
                    <p className="italic text-muted-foreground text-left">
                      {active.latin}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                {[
                  { l: 'Размер', v: active.size, i: 'Ruler' },
                  { l: 'Жизнь', v: active.lifespan, i: 'Clock' },
                  { l: 'Питание', v: active.diet, i: 'Leaf' },
                  { l: 'Среда', v: active.habitat, i: 'Trees' },
                ].map((f) => (
                  <div
                    key={f.l}
                    className="border border-border rounded-sm p-3 bg-background/50"
                  >
                    <Icon name={f.i} size={15} className="text-accent mb-1" />
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-sans">
                      {f.l}
                    </p>
                    <p className="text-xs leading-snug">{f.v}</p>
                  </div>
                ))}
              </div>

              <p className="text-foreground/85 leading-relaxed">
                {active.description}
              </p>

              <div className="my-4">
                <h4 className="font-display text-xl mb-2">
                  Научная классификация
                </h4>
                <div className="border border-border rounded-sm divide-y divide-border">
                  {active.classification.map((c) => (
                    <div
                      key={c.rank}
                      className="flex justify-between px-4 py-2 text-sm"
                    >
                      <span className="text-muted-foreground font-sans">
                        {c.rank}
                      </span>
                      <span className="font-500">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-display text-xl mb-2">Интересные факты</h4>
                <ul className="space-y-2">
                  {active.facts.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/85">
                      <Icon
                        name="Sparkle"
                        size={15}
                        className="text-accent mt-0.5 shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SectionTitle = ({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub: string;
}) => (
  <div className="mb-10">
    <p className="font-sans text-xs uppercase tracking-[0.3em] text-accent mb-2">
      {kicker}
    </p>
    <h2 className="font-display text-4xl sm:text-5xl font-600">{title}</h2>
    <div className="w-16 h-px deco-rule my-4" />
    <p className="text-muted-foreground max-w-2xl">{sub}</p>
  </div>
);

const Home = ({
  goto,
  progress,
  unlocked,
}: {
  goto: (s: string) => void;
  progress: number;
  unlocked: number;
}) => (
  <div className="animate-fade-in">
    <section className="grid lg:grid-cols-2 gap-10 items-center mb-20">
      <div>
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-accent mb-4">
          Classis · Insecta
        </p>
        <h1 className="font-display text-5xl sm:text-7xl font-700 leading-[0.95] mb-6">
          Энциклопедия<br />насекомых
        </h1>
        <p className="text-lg text-foreground/75 max-w-md mb-8 leading-relaxed">
          Строгая научная классификация, подробные карточки видов и система
          кредитов для открытия знаний. Изучайте мир членистоногих как
          настоящий энтомолог.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => goto('catalog')}
            className="rounded-sm font-sans"
            size="lg"
          >
            <Icon name="LibraryBig" size={18} className="mr-2" />
            Открыть каталог
          </Button>
          <Button
            onClick={() => goto('taxonomy')}
            variant="outline"
            className="rounded-sm font-sans border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            size="lg"
          >
            Классификация
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="absolute -inset-3 border border-accent/30 rounded-sm" />
        <img
          src={HERO_IMG}
          alt="Энтомологическая иллюстрация"
          className="rounded-sm w-full object-cover aspect-square sepia-[0.15] shadow-xl"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur border border-border rounded-sm p-3 text-xs font-sans">
          <span className="italic text-muted-foreground">Tabula I.</span>{' '}
          Образцы научной коллекции
        </div>
      </div>
    </section>

    <section className="grid sm:grid-cols-3 gap-6 mb-20">
      {[
        { i: 'BookMarked', n: `${INSECTS_LEN}`, l: 'видов в каталоге' },
        { i: 'CheckCircle2', n: `${unlocked}`, l: 'открыто вами' },
        { i: 'TrendingUp', n: `${progress}%`, l: 'прогресс коллекции' },
      ].map((s) => (
        <div
          key={s.l}
          className="border border-border bg-card rounded-sm p-6 text-center"
        >
          <Icon name={s.i} size={24} className="text-accent mx-auto mb-3" />
          <p className="font-display text-4xl font-700">{s.n}</p>
          <p className="text-sm text-muted-foreground font-sans">{s.l}</p>
        </div>
      ))}
    </section>

    <section className="border-y border-border py-12 text-center">
      <p className="font-display text-3xl sm:text-4xl max-w-3xl mx-auto italic leading-snug">
        «Насекомые — самый многочисленный класс животных на Земле: описано
        более миллиона видов».
      </p>
      <p className="font-sans text-sm text-muted-foreground mt-4">
        — из вводного раздела энциклопедии
      </p>
    </section>
  </div>
);

const INSECTS_LEN = INSECTS.length;

const Taxonomy = () => {
  const grouped = ORDERS.slice(1).map((o) => ({
    order: o,
    items: INSECTS.filter((i) => i.order === o),
  }));
  return (
    <section className="animate-fade-in">
      <SectionTitle
        kicker="Systema Naturae"
        title="Иерархическая классификация"
        sub="Систематика отражает родственные связи. Ниже — отряды и относящиеся к ним виды."
      />
      <div className="space-y-8">
        {grouped.map((g) => (
          <div key={g.order} className="border border-border rounded-sm bg-card">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-secondary/40">
              <Icon name="GitBranch" size={18} className="text-accent" />
              <h3 className="font-display text-2xl font-600">{g.order}</h3>
              <span className="text-xs font-sans text-muted-foreground ml-auto">
                {g.items.length} вид(ов)
              </span>
            </div>
            <div className="divide-y divide-border">
              {g.items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-4 px-6 py-3"
                >
                  <span className="text-2xl">{i.emoji}</span>
                  <div>
                    <p className="font-500">{i.commonName}</p>
                    <p className="italic text-sm text-muted-foreground">
                      {i.latin} · сем. {i.family}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Profile = ({
  credits,
  unlocked,
  progress,
  goto,
}: {
  credits: number;
  unlocked: string[];
  progress: number;
  goto: (s: string) => void;
}) => (
  <section className="animate-fade-in">
    <SectionTitle
      kicker="Curriculum"
      title="Личный кабинет"
      sub="Ваш баланс кредитов и прогресс исследования энциклопедии."
    />
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      <div className="border border-accent bg-card rounded-sm p-6">
        <Icon name="Coins" size={22} className="text-accent mb-3" />
        <p className="font-display text-5xl font-700">{credits}</p>
        <p className="text-sm text-muted-foreground font-sans">
          кредитов на счету
        </p>
        <Button
          onClick={() => goto('farm')}
          variant="outline"
          size="sm"
          className="mt-4 rounded-sm font-sans border-accent text-accent"
        >
          Собрать на ферме
        </Button>
      </div>
      <div className="border border-border bg-card rounded-sm p-6">
        <Icon name="Layers" size={22} className="text-accent mb-3" />
        <p className="font-display text-5xl font-700">
          {unlocked.length}/{INSECTS.length}
        </p>
        <p className="text-sm text-muted-foreground font-sans">
          карточек открыто
        </p>
      </div>
      <div className="border border-border bg-card rounded-sm p-6">
        <Icon name="Trophy" size={22} className="text-accent mb-3" />
        <p className="font-display text-5xl font-700">{progress}%</p>
        <p className="text-sm text-muted-foreground font-sans">
          коллекция собрана
        </p>
      </div>
    </div>

    <div className="border border-border bg-card rounded-sm p-6">
      <div className="flex justify-between text-sm font-sans mb-2">
        <span>Прогресс коллекции</span>
        <span className="text-accent">{progress}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-sm overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-700 deco-rule"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h4 className="font-display text-xl mt-6 mb-3">Открытые виды</h4>
      <div className="flex flex-wrap gap-2">
        {unlocked.length === 0 && (
          <p className="text-muted-foreground italic">
            Пока ничего не открыто. Загляните в каталог.
          </p>
        )}
        {unlocked.map((id) => {
          const ins = INSECTS.find((i) => i.id === id)!;
          return (
            <span
              key={id}
              className="flex items-center gap-1.5 border border-border rounded-sm px-3 py-1.5 text-sm bg-background/50"
            >
              {ins.emoji} {ins.commonName}
            </span>
          );
        })}
      </div>
    </div>
  </section>
);

const DAY_MS = 24 * 60 * 60 * 1000;

const fmt = (ms: number) => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const Farm = ({
  canHarvest,
  onHarvest,
  lastHarvest,
  lastReward,
}: {
  canHarvest: boolean;
  onHarvest: () => void;
  lastHarvest: number | null;
  lastReward: number | null;
}) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining =
    lastHarvest && !canHarvest
      ? Math.max(0, lastHarvest + DAY_MS - now)
      : 0;

  return (
    <section className="animate-fade-in">
      <SectionTitle
        kicker="Cultura"
        title="Монетизация кредитов"
        sub="Раз в сутки собирайте урожай с энто-фермы и получайте случайное количество кредитов — от 0 до 100."
      />

      <div className="max-w-xl mx-auto">
        <div className="border border-accent rounded-sm bg-card p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 deco-rule opacity-60" />

          <div
            className={`text-8xl mb-4 inline-block ${
              canHarvest ? 'animate-count-pulse' : 'grayscale opacity-70'
            }`}
          >
            🐜
          </div>

          <h3 className="font-display text-3xl font-600 mb-2">
            Энтомологическая ферма
          </h3>

          {lastReward !== null && (
            <p className="text-sm text-muted-foreground font-sans mb-6">
              Прошлый сбор:{' '}
              <span className="text-accent font-600">{lastReward} кр.</span>
            </p>
          )}

          {canHarvest ? (
            <>
              <p className="text-foreground/75 mb-6">
                Урожай созрел! Соберите кредиты прямо сейчас.
              </p>
              <Button
                onClick={onHarvest}
                size="lg"
                className="rounded-sm font-sans"
              >
                <Icon name="Sprout" size={18} className="mr-2" />
                Собрать урожай
              </Button>
            </>
          ) : (
            <>
              <p className="text-foreground/75 mb-4">
                Ферма восстанавливается. Возвращайтесь через:
              </p>
              <div className="font-display text-5xl font-700 tabular-nums text-accent mb-6">
                {fmt(remaining)}
              </div>
              <Button size="lg" disabled className="rounded-sm font-sans">
                <Icon name="Clock" size={18} className="mr-2" />
                Недоступно
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { i: 'Gift', l: '0–100 кр.', s: 'за один сбор' },
            { i: 'CalendarCheck', l: 'Раз в день', s: 'обновление' },
            { i: 'Dice5', l: 'Случайно', s: 'каждый раз' },
          ].map((c) => (
            <div
              key={c.l}
              className="border border-border rounded-sm bg-card p-4 text-center"
            >
              <Icon name={c.i} size={20} className="text-accent mx-auto mb-2" />
              <p className="font-display text-lg font-600">{c.l}</p>
              <p className="text-xs text-muted-foreground font-sans">{c.s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contacts = ({
  toast,
}: {
  toast: (o: { title: string; description: string }) => void;
}) => {
  const [form, setForm] = useState({ name: '', email: '', msg: '' });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Сообщение отправлено',
      description: 'Спасибо! Мы ответим вам в ближайшее время.',
    });
    setForm({ name: '', email: '', msg: '' });
  };
  return (
    <section className="animate-fade-in max-w-2xl">
      <SectionTitle
        kicker="Correspondentia"
        title="Контакты и обратная связь"
        sub="Нашли неточность или хотите предложить новый вид? Напишите нам."
      />
      <form onSubmit={submit} className="space-y-4 mb-10">
        <Input
          placeholder="Ваше имя"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="bg-card border-border rounded-sm"
        />
        <Input
          type="email"
          placeholder="Электронная почта"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="bg-card border-border rounded-sm"
        />
        <Textarea
          placeholder="Ваше сообщение"
          value={form.msg}
          onChange={(e) => setForm({ ...form, msg: e.target.value })}
          required
          rows={5}
          className="bg-card border-border rounded-sm"
        />
        <Button type="submit" className="rounded-sm font-sans">
          <Icon name="Send" size={16} className="mr-2" />
          Отправить
        </Button>
      </form>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { i: 'Mail', l: 'info@entomologia.ru' },
          { i: 'MapPin', l: 'Москва, ул. Научная, 1' },
          { i: 'Phone', l: '+7 495 000-00-00' },
        ].map((c) => (
          <div
            key={c.l}
            className="border border-border rounded-sm p-4 bg-card text-sm flex items-center gap-2"
          >
            <Icon name={c.i} size={16} className="text-accent shrink-0" />
            {c.l}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Index;