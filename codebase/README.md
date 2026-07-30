# Prototype codebase

Để giữ nguyên cấu hình Vinext/OpenAI Sites, source prototype nằm ở root repo:

- `app/`: UI, API route và product intelligence.
- `content/`: knowledge base đã biên tập.
- `tests/`: test SSR và API contract.

Lời gọi AI thật nằm tại `app/api/chat/route.ts`. Retrieval và web tools không
được mock. Readiness quiz là heuristic định hướng được khai báo rõ; handoff chỉ
mở email khi người dùng chủ động bấm.
