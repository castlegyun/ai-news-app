export function NewsCountBadge({ total }: { total: number }) {
  return (
    <span className="text-base font-bold tracking-[1.5px] text-muted uppercase">
      총 {total.toLocaleString("ko-KR")}개 뉴스
    </span>
  );
}
