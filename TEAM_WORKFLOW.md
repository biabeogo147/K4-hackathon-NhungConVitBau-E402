# Phân công và quy trình Git

Mỗi thành viên làm trên một Git worktree riêng trong thư mục `Downloads`.
Worktree dùng chung lịch sử Git nhưng có branch và file làm việc độc lập, vì vậy
không cần sao chép `node_modules` hoặc toàn bộ repository nhiều lần.

| Thành viên | Mã học viên | Folder | Branch | Deliverable chính |
|---|---|---|---|---|
| Nguyễn Đàm Kiên | 2A202602015 | `AI-Thuc-Chien-01-Nguyen-Dam-Kien` | `team/kien-evidence` | Evidence log, phương pháp mining, nguồn được duyệt |
| Lê Nguyễn Phước Thành | 2A202601032 | `AI-Thuc-Chien-02-Le-Nguyen-Phuoc-Thanh` | `team/thanh-ai-eval` | Prompt, RAG, golden set và kết quả eval |
| Nguyễn Văn Nam | 2A202601973 | `AI-Thuc-Chien-03-Nguyen-Van-Nam` | `team/nam-integration` | API/tools, tích hợp, test, merge và release |
| Lê Kim Tinh | 2A202601560 | `AI-Thuc-Chien-04-Le-Kim-Tinh` | `team/tinh-ux` | UI, readiness flow, responsive và accessibility |
| Trần Chí Hiển | 2A202601162 | `AI-Thuc-Chien-05-Tran-Chi-Hien` | `team/hien-validation-demo` | User validation, spec, demo slides và repo QA |

## Phạm vi chi tiết

### Nguyễn Đàm Kiên — Evidence và nguồn

- Hoàn thiện evidence A hoặc B theo rubric.
- Ghi mẫu số, quy tắc đếm và ít nhất 5 ví dụ có nguồn.
- Kiểm tra freshness/audience của các file trong `content/`.
- Không đưa dữ liệu cá nhân hoặc data pack bị hạn chế vào Git.

### Lê Nguyễn Phước Thành — AI và evaluation

- Tối ưu system prompt, retrieval và follow-up.
- Duy trì golden set tối thiểu 20 case, đủ bốn lớp chỗ khó.
- Chạy và chấm toàn bộ output AI, không chỉ intent routing.
- Ghi mọi lượt chạy vào `eval/`, kể cả case fail.

### Nguyễn Văn Nam — Integration và release

- Duy trì API Gemini, web tools, guardrail và response contract.
- Tích hợp thay đổi từ bốn branch còn lại.
- Chạy build, lint, automated tests và kiểm tra không lộ secret/model.
- Chịu trách nhiệm bản demo local và bản release cuối.

### Lê Kim Tinh — UX/UI

- Hoàn thiện trải nghiệm ba giai đoạn: tìm hiểu, dự tuyển, sắp tham gia.
- Kiểm tra readiness flow, loading, error, empty và handoff.
- Kiểm tra responsive, bàn phím, độ tương phản và nội dung dễ hiểu.
- Không trình bày readiness score như kết quả tuyển chọn.

### Trần Chí Hiển — Validation và demo

- Tổ chức tối thiểu 5 phiên user test và ghi quote thật.
- Cập nhật changelog từ feedback hoặc ghi lý do giữ nguyên.
- Hoàn thiện `spec.md`, reflection từng thành viên và slide 6 trang.
- Xuất `demo-slides.pdf` và dry-run demo 5 phút.

## Quy tắc commit

1. Mỗi người chỉ commit trên branch được giao.
2. Cấu hình đúng tên và email Git của chính mình; không commit thay danh tính.
3. Mỗi commit giải quyết một thay đổi có thể kiểm tra được.
4. Trước khi bàn giao: chạy test liên quan và ghi kết quả trong pull request.
5. Nguyễn Văn Nam review rồi mới merge vào `main`.

Ví dụ:

```bash
git status
git add <file-cua-phan-viec>
git commit -m "Mô tả ngắn kết quả đã hoàn thành"
git push -u origin <ten-branch>
```
