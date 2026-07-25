"use client";
import { useEffect, useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Phone, Mail, Tag, ArrowUpDown } from "lucide-react";
import { leadsApi } from "@/lib/api";
import { cn, formatPhone, formatCurrency, formatDate } from "@/lib/utils";

interface Lead { id: string; name?: string; phone: string; email?: string; status: string; score: number; tags: string[]; createdAt: string; _count: { tasks: number; conversations: number }; deals: any[]; }

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsApi.list({ search, status: statusFilter, page, limit: 10 });
      setLeads(data.leads);
      setTotalPages(data.totalPages);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [search, statusFilter, page]);

  const statusColors: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    QUALIFIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    CONTACTED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    PROPOSAL: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    NEGOTIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    WON: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar leads..." className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos status</option>
          <option value="NEW">Novo</option>
          <option value="QUALIFIED">Qualificado</option>
          <option value="CONTACTED">Contatado</option>
          <option value="PROPOSAL">Proposta</option>
          <option value="NEGOTIATION">Negociação</option>
          <option value="WON">Fechado</option>
          <option value="LOST">Perdido</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Último contato</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leads.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum lead encontrado</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.name || "Sem nome"}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {formatPhone(lead.phone)}
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                      </div>
                      {lead.tags.length > 0 && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {lead.tags.slice(0, 3).map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{t}</span>)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[lead.status])}>{lead.status}</span>
                    </td>
                    <td className="px-4 py-3">{lead.score}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:underline text-sm">Ver</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}