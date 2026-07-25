import { NextResponse } from "next/server";

let congregations: any[] = [
  { id: "cong-001", churchId: "church-001", name: "Central", pastorName: "Pr. João Silva", pastorEmail: "pastor@novavida.com.br", pastorPhone: "11999990001", patrimonio: "Templo principal", memberCount: 120, address: "Av. Principal, 500", status: "active", createdAt: new Date().toISOString() },
  { id: "cong-002", churchId: "church-001", name: "Jardim", pastorName: "Pr. Carlos Mendes", pastorEmail: "carlos@novavida.com.br", pastorPhone: "11999990005", patrimonio: "Salão alugado", memberCount: 45, address: "Rua das Flores, 250", status: "active", createdAt: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json({ data: congregations });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const c = {
      id: `cong-${Date.now()}`,
      churchId: body.churchId || "church-001",
      name: body.name,
      pastorName: body.pastorName,
      pastorEmail: body.pastorEmail || null,
      pastorPhone: body.pastorPhone || null,
      patrimonio: body.patrimonio || null,
      memberCount: body.memberCount || 0,
      address: body.address || null,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    congregations.push(c);
    return NextResponse.json({ data: c, error: null }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ data: null, error: { message: e.message } }, { status: 500 });
  }
}
