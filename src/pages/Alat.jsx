import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { usePageTitle } from "../lib/hooks.js";
import { useTimers } from "../lib/timers.jsx";
import { useUserStore } from "../lib/userStore.js";
import Icon from "../components/icons.jsx";
import { PremiumGate } from "../components/ui.jsx";
import Planner from "./alat/Planner.jsx";
import EventCalc from "./alat/EventCalc.jsx";
import MultiTimer from "./alat/MultiTimer.jsx";
import CookTime from "./alat/CookTime.jsx";
import Marinade from "./alat/Marinade.jsx";
import Convert from "./alat/Convert.jsx";
import { Nutrition, PricePerPortion, Thaw } from "./alat/Basics.jsx";

export const ALAT_GROUPS = [
  {
    id: "rencana",
    title: "Rencanakan",
    desc: "Sebelum belanja",
    tools: [
      { id: "rencana", label: "Rencana mingguan", icon: "calendar", desc: "Susun menu seminggu. Stok kulkas dipakai dulu, sisanya jadi daftar belanja.", View: Planner },
      { id: "acara", label: "Acara & kurban", icon: "users", desc: "Kebutuhan daging untuk tamu, atau pembagian daging kurban.", View: EventCalc },
    ],
  },
  {
    id: "masak",
    title: "Saat memasak",
    desc: "Di dapur",
    tools: [
      { id: "timer", label: "Multi-timer", icon: "clock", desc: "Beberapa timer sekaligus, tetap jalan saat pindah halaman.", View: MultiTimer },
      { id: "masak", label: "Waktu masak", icon: "flame", desc: "Waktu steak per sisi, rebus, dan presto per potongan.", View: CookTime },
      { id: "marinasi", label: "Marinasi & garam", icon: "drop", desc: "Takaran garam dan bumbu sesuai berat, plus lama marinasi.", View: Marinade },
      { id: "thaw", label: "Thawing", icon: "snow", desc: "Lama mencairkan daging beku dengan aman.", View: Thaw },
    ],
  },
  {
    id: "hitung",
    title: "Hitung & cek",
    desc: "Kapan saja",
    tools: [
      { id: "konversi", label: "Konversi takaran", icon: "scale", desc: "Ons, pon, gram, sendok, cup, dan suhu oven.", View: Convert },
      { id: "nutrisi", label: "Nutrisi", icon: "chart", desc: "Kalori, protein, dan lemak per potongan.", View: Nutrition },
      { id: "harga", label: "Harga per porsi", icon: "tag", desc: "Biaya per porsi setelah susut masak dan tulang.", View: PricePerPortion },
    ],
  },
];
export const ALAT_TOOLS = ALAT_GROUPS.flatMap((g) => g.tools.map((t) => ({ ...t, group: g.title })));

// Live one-liners shown on hub cards and in the sidebar.
function useToolStatus() {
  const { user } = useAuth();
  const { timers } = useTimers();
  const [plan] = useUserStore(user?.email, "mealplan", { meals: [] });
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const meals = plan.meals.filter((m) => m.date >= iso).length;
  const running = timers.filter((t) => t.status === "running").length;
  const done = timers.filter((t) => t.status === "done").length;
  return {
    rencana: meals ? `${meals} menu direncanakan` : null,
    timer: done ? `${done} selesai` : running ? `${running} berjalan` : null,
  };
}

export default function Alat() {
  const { isPremium, upgradeToPremium } = useAuth();
  const [params] = useSearchParams();
  const tool = ALAT_TOOLS.find((t) => t.id === params.get("tab"));
  usePageTitle(tool ? tool.label : "Alat dapur");

  if (!isPremium) {
    return (
      <PremiumGate
        eyebrow="Alat dapur"
        title="Hitung, rencanakan, masak pas"
        desc="Sembilan alat untuk merencanakan menu, menghitung kebutuhan daging, dan memasak dengan tepat."
        lockTitle="Alat dapur khusus Premium"
        lockDesc="Upgrade untuk membuka semua alat. Belanja, resep, dan pelacakan pesanan tetap gratis."
        features={ALAT_TOOLS.map((t) => `${t.label}: ${t.desc}`)}
        onUpgrade={upgradeToPremium}
      >
        <HubGrid status={{}} />
      </PremiumGate>
    );
  }

  return tool ? <ToolView tool={tool} /> : <Hub />;
}

function Hub() {
  const status = useToolStatus();
  return (
    <div>
      <section className="border-b border-ink/5 bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:pb-10 sm:pt-12">
          <p className="eyebrow">Alat dapur</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">Hitung, rencanakan, masak pas</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/60">Pilih alat sesuai yang sedang kamu kerjakan: merencanakan belanja, memasak di dapur, atau sekadar menghitung.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <HubGrid status={status} />
      </div>
    </div>
  );
}

function HubGrid({ status }) {
  return (
    <div className="space-y-10">
      {ALAT_GROUPS.map((g) => (
        <section key={g.id}>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl font-bold">{g.title}</h2>
            <span className="text-sm text-ink/40">{g.desc}</span>
          </div>
          <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${g.tools.length > 2 ? "lg:grid-cols-4" : "lg:grid-cols-2"}`}>
            {g.tools.map((t) => {
              const s = status[t.id];
              const big = g.tools.length <= 2;
              return (
                <Link
                  key={t.id}
                  to={`/alat?tab=${t.id}`}
                  className={`group flex rounded-xl3 bg-white ring-1 ring-ink/10 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-ink/20 ${big ? "items-start gap-4 p-6" : "flex-col p-5"}`}
                >
                  <span className={`grid shrink-0 place-items-center rounded-2xl bg-coralsoft text-coral transition-colors group-hover:bg-coral group-hover:text-white ${big ? "h-12 w-12" : "h-11 w-11"}`}>
                    <Icon name={t.icon} className="h-[22px] w-[22px]" />
                  </span>
                  <span className={`flex min-w-0 flex-1 flex-col ${big ? "" : "mt-4"}`}>
                    <span className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold group-hover:text-coral">{t.label}</span>
                      <Icon name="chevron" className="ml-auto h-4 w-4 text-ink/25 transition-transform group-hover:translate-x-0.5 group-hover:text-coral" />
                    </span>
                    <span className="mt-1 text-sm leading-relaxed text-ink/55">{t.desc}</span>
                    {s && (
                      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-mintsoft px-2.5 py-0.5 text-xs font-semibold text-mint">
                        <span className="h-1.5 w-1.5 rounded-full bg-mint" /> {s}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function ToolView({ tool }) {
  const status = useToolStatus();
  const View = tool.View;
  // the path stays /alat when switching tools, so the global scroll reset doesn't fire
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tool.id]);
  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr] xl:gap-10">
        {/* sidebar (desktop) */}
        <aside className="hidden lg:block">
          <nav aria-label="Daftar alat" className="sticky top-24 space-y-6">
            <Link to="/alat" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5 hover:text-ink">
              <Icon name="grid" className="h-4 w-4" /> Semua alat
            </Link>
            {ALAT_GROUPS.map((g) => (
              <div key={g.id}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink/40">{g.title}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {g.tools.map((t) => {
                    const on = t.id === tool.id;
                    return (
                      <li key={t.id}>
                        <Link
                          to={`/alat?tab=${t.id}`}
                          aria-current={on ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${on ? "bg-white text-ink shadow-card ring-1 ring-ink/10" : "text-ink/60 hover:bg-ink/5 hover:text-ink"}`}
                        >
                          <Icon name={t.icon} className={`h-4 w-4 shrink-0 ${on ? "text-coral" : ""}`} />
                          <span className="flex-1 truncate">{t.label}</span>
                          {status[t.id] && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mint" title={status[t.id]} />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <div className="min-w-0">
          <Link to="/alat" className="inline-flex items-center gap-1 text-sm font-semibold text-ink/55 hover:text-coral lg:hidden">
            <Icon name="back" className="h-4 w-4" /> Semua alat
          </Link>
          <header className="mt-3 flex items-start gap-4 border-b border-ink/5 pb-6 lg:mt-0">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coralsoft text-coral">
              <Icon name={tool.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/40">{tool.group}</p>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{tool.label}</h1>
              <p className="mt-1 text-sm text-ink/55">{tool.desc}</p>
            </div>
          </header>
          <div className="pt-6">
            <View key={tool.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
