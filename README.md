# Trợ lý AI Thực Chiến

Prototype **Hướng C — Làn mở** của Mini Hackathon AI: trợ lý dành cho người
đang tìm hiểu, chuẩn bị dự tuyển hoặc sắp tham gia Chương trình AI Thực Chiến.
Sản phẩm giúp người dùng hiểu sâu chương trình, đánh giá mức phù hợp và nhận
lộ trình chuẩn bị có căn cứ; thông tin chưa thể xác minh được chuyển Ban Tổ chức.

## Thông tin nhóm

| Thành viên | Mã học viên | Phần phụ trách |
|---|---|---|
| Nguyễn Văn Nam | 2A202601973 | Product lead, AI orchestration và tích hợp |
| Nguyễn Đàm Kiên | 2A202602015 | Evidence, mining và biên tập knowledge base |
| Lê Nguyễn Phước Thành | 2A202601032 | Frontend, UX và responsive |
| Lê Kim Tịnh | 2A202601560 | Prompt, golden set và evaluation |
| Trần Chí Hiển | 2A202601162 | Validation, spec và demo |

## Tính năng

- Hỏi đáp có citation, cảnh báo thông tin theo khóa và fallback an toàn.
- Tìm kiếm website chính thức qua Tavily/Firecrawl (tùy cấu hình).
- Nhận diện nhu cầu: tuyển sinh, nội dung học, mức độ phù hợp, chuẩn bị, quyền
  lợi, lịch trình, kỳ thi và onboarding.
- Hiển thị quyết định dùng kho chương trình, web tool hay cần xác minh.
- Đánh giá mức độ sẵn sàng và tạo lộ trình chuẩn bị cá nhân hóa.
- Câu hỏi tiếp nối theo intent, ghi nhớ hội thoại trong phiên trình duyệt.
- Timeout, thử lại, empty/loading/error state và chuyển tiếp Ban Tổ chức.
- Backend chỉ luân phiên giữa hai model Gemini đã được cấu hình trong code.

## Chạy local

Yêu cầu Node.js `>=22.13.0`.

```bash
npm install
copy .env.example .env
npm run dev
```

Điền `GEMINI_API_KEY` trong `.env`. `TAVILY_API_KEY` và
`FIRECRAWL_API_KEY` là tùy chọn; nếu công cụ ngoài lỗi, RAG nội bộ vẫn hoạt
động. Không commit file `.env`.

Mở [http://localhost:3000](http://localhost:3000).

## Kiểm thử

```bash
npm test
npm run lint
```

Các kiểm tra bao gồm build production, SSR giao diện chính, bảo đảm không lộ
tên model và validation của API chat.

## Cấu trúc chính

- `app/api/chat/route.ts`: orchestration, prompt, Gemini và response contract.
- `app/lib/knowledge.ts`: chunking và retrieval tài liệu nội bộ.
- `app/lib/official-tools.ts`: tìm/scrape nguồn chính thức có allowlist.
- `app/lib/product-intelligence.ts`: phân loại ý định, follow-up và handoff.
- `app/ui/ChatApp.tsx`: trải nghiệm chat và readiness assessment.
- `content/`: kho dữ liệu Markdown cần được chủ sở hữu cập nhật/duyệt.
- `spec.md`: AI Spec theo template của hackathon.
- `eval/`: golden set và hướng dẫn ghi kết quả từng lượt.
- `validation/`: template ghi feedback user test.
- `reflection/`: template reflection cá nhân.

## Dữ liệu cần thay thế

`content/03-thong-bao-zalo.md` nhạy cảm theo thời gian và
`content/05-qa-thuc-te.md` chưa hoàn chỉnh. Trước khi mở rộng cho người dùng
thật, cần gắn ngày hiệu lực, người duyệt và quy trình cập nhật cho từng tài liệu.
