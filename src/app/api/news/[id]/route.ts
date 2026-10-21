import { auth } from "@clerk/nextjs/server";

import { deleteArticle, isCategoryId } from "@/db/queries";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  // 기사 id도 UUID 형식이라 같은 검사를 재사용한다.
  if (!isCategoryId(id)) {
    return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const deleted = await deleteArticle(id);
    if (!deleted) {
      return Response.json({ error: "기사를 찾을 수 없습니다." }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch (error) {
    console.error("기사 삭제 실패", error);
    return Response.json(
      { error: "기사를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
