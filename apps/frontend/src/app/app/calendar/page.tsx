"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { apiFetch } from "../../../lib/api";

interface AppointmentItem {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  meetingUrl?: string | null;
  description?: string | null;
}

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function CalendarPage() {
  const [today] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const { data: appointments, isLoading } = useSWR("/appointments", async (url: string) => {
    const r = await apiFetch<AppointmentItem[]>(url);
    return r;
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => setViewDate(new Date());

  const days = useMemo(() => {
    const result: { day: number; appointments: AppointmentItem[] }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayApps = (appointments || []).filter((a) => {
        const aDate = new Date(a.startAt);
        return (
          aDate.getFullYear() === year &&
          aDate.getMonth() === month &&
          aDate.getDate() === d
        );
      });
      result.push({ day: d, appointments: dayApps });
    }
    return result;
  }, [appointments, year, month, daysInMonth]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-[#F5F5F2]">Agenda</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="rounded-lg border border-[#D4AF37]/30 px-3 py-1.5 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Hoje
          </button>
          <button
            onClick={prevMonth}
            className="rounded-lg border border-[#D4AF37]/30 px-2 py-1 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            ←
          </button>
          <span className="text-sm font-medium text-[#F5F5F2] min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg border border-[#D4AF37]/30 px-2 py-1 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            →
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-xs text-[#8A8A8A] font-medium py-2">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-[#D4AF37]/10 rounded-lg overflow-hidden">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] bg-[#0D0D0D]" />
            ))}
            {days.map(({ day, appointments: dayApps }) => {
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              return (
                <div
                  key={day}
                  className={`min-h-[100px] bg-[#0D0D0D] p-1.5 transition hover:bg-[#141414] ${
                    isToday ? "ring-1 ring-inset ring-[#D4AF37]/40" : ""
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-[#D4AF37] text-[#0B0B0B] font-bold"
                        : "text-[#8A8A8A]"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {dayApps.slice(0, 3).map((a) => {
                      const start = new Date(a.startAt);
                      const time = start.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return (
                        <div
                          key={a.id}
                          className="truncate rounded bg-[#D4AF37]/15 px-1 py-0.5 text-[10px] text-[#D4AF37]/90"
                          title={a.title}
                        >
                          {time} {a.title}
                        </div>
                      );
                    })}
                    {dayApps.length > 3 && (
                      <span className="text-[10px] text-[#8A8A8A]">+{dayApps.length - 3} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {appointments && appointments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-[#F5F5F2] mb-3">Próximos compromissos</h2>
              <div className="flex flex-col gap-2">
                {appointments
                  .filter((a) => new Date(a.startAt) >= today)
                  .slice(0, 10)
                  .map((a) => {
                    const start = new Date(a.startAt);
                    const end = new Date(a.endAt);
                    return (
                      <div
                        key={a.id}
                        className="rounded-lg border border-[#D4AF37]/15 bg-[#0D0D0D] p-3 transition hover:border-[#D4AF37]/30"
                      >
                        <p className="text-sm font-medium text-[#F5F5F2]">{a.title}</p>
                        <p className="text-xs text-[#8A8A8A] mt-1">
                          {start.toLocaleDateString("pt-BR")} · {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} → {end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {(a.location || a.meetingUrl) && (
                          <p className="text-xs text-[#D4AF37]/70 mt-0.5">
                            {a.location && `📍 ${a.location}`}
                            {a.meetingUrl && (a.location ? " · " : "")}
                            {a.meetingUrl && `🔗 ${a.meetingUrl}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
