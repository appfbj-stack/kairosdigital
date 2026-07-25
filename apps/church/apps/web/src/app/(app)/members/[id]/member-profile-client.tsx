"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteMemberDialog } from "@/features/members/components/delete-member-dialog";
import type { Database } from "@kairos/types";

type Member = Database["public"]["Tables"]["members"]["Row"];

export function MemberProfileClient({ member }: { member: Member }) {
  return (
    <div className="flex gap-3 pt-2 border-t">
      <Link
        href={`/members/${member.id}/edit`}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Editar
      </Link>
      <DeleteMemberDialog memberId={member.id} memberName={member.name} />
    </div>
  );
}
