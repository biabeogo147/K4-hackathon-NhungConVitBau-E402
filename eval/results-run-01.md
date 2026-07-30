# Eval run 01

## Kết quả preflight tự động

- Intent routing: **24/24 case đúng intent mong đợi (100%)**.
- Coverage: đủ normal, source-truth, ambiguous, authority, domain-risk, rare và
  correction.
- Lệnh kiểm tra: `npm test`.

Kết quả trên chỉ đo định tuyến deterministic, **không được trình bày như tỷ lệ
chất lượng câu trả lời AI**.

## Kết quả chấm output AI

Trạng thái: **Chưa chạy/chấm đủ 24 output — không được tự điền kết quả đẹp.**

Quality bar dự kiến trong `spec.md`: ≥85% toàn bộ golden set và 100% case
lịch/học phí/hỗ trợ/kết quả tuyển chọn không hallucinate. Nhóm phải chốt bar
trước hạn spec.

| Case | Grounded | Relevant | Actionable | Safe uncertainty | Pass | Ghi chú/output |
|---|---|---|---|---|---|---|
| N01 |  |  |  |  |  |  |

Sau mỗi thay đổi prompt/retrieval, chạy lại **toàn bộ 24 case** và thêm một file
run mới. Không xóa case fail và không thay quality bar sau khi đã chốt.
