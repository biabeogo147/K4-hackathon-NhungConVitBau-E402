# AI SPEC — [Tên lát cắt] · Nhóm [Những con vịt bầu] · Zone [3]
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [X] C — Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [X] Tính năng mới

## §1. User & Job
  - Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):
  - ≥5 quote/ví dụ nguyên văn + nguồn:

- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
  * **Job executor:** Học viên đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học.
  * **Workflow hiện tại:**

    1. Học viên phát sinh câu hỏi về khóa học, thời gian nhập học, cơ sở vật chất, nội quy hoặc quy định.
    2. Học viên tự tìm kiếm thông tin trên website, tài liệu, email hoặc nhóm trao đổi.
    3. Nếu không tìm thấy, học viên liên hệ nhân viên tư vấn, giảng viên hoặc bộ phận phụ trách.
    4. Người phụ trách kiểm tra thông tin và trả lời.
    5. Các học viên khác tiếp tục hỏi lại những câu hỏi tương tự.


- Core JTBD (không tên sản phẩm/AI trong câu):
  > Khi đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học, học viên muốn nhanh chóng tìm được câu trả lời chính xác cho các câu hỏi cơ bản để có thể chuẩn bị đầy đủ và yên tâm tham gia học tập.

- Problem statement (KHÔNG chữ AI):
  > Học viên trước và mới tham gia khóa học gặp khó khăn khi tìm kiếm các thông tin cơ bản vì thông tin nằm rải rác ở nhiều nguồn, khó tìm hoặc chưa được trình bày rõ ràng. Điều này khiến học viên mất thời gian chờ đợi, dễ bỏ sót thông tin quan trọng và phải liên hệ người phụ trách nhiều lần. Đồng thời, nhân viên nhà trường phải lặp lại việc trả lời các câu hỏi tương tự, làm giảm thời gian dành cho những trường hợp cần hỗ trợ chuyên sâu.

- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  * **Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):**

    * Đối tượng khảo sát: Học viên đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học.
    * Cỡ mẫu: `n = 44`
    * Số người xác nhận từng gặp khó khăn khi tìm thông tin cơ bản: `.../...`
    * Tỷ lệ xác nhận: `...%`
    * Số người từng phải hỏi nhân viên hoặc giảng viên về các câu hỏi cơ bản: `.../...`
    * Tỷ lệ sẵn sàng sử dụng công cụ hỏi đáp nhanh: `...%`
    * Nguồn dữ liệu trong repo: `research/survey-results.csv`, `research/mining-results.md`

  * **≥5 quote/ví dụ nguyên văn + nguồn:**

    1. > “[Điền nguyên văn câu trả lời của học viên về việc khó tìm thông tin.]”
       > **Nguồn:** Khảo sát học viên – mã `HV01`, lưu tại `research/evidence-quotes.md`.

    2. > “[Điền nguyên văn câu trả lời về việc phải hỏi lại nhân viên hoặc giảng viên.]”
       > **Nguồn:** Khảo sát học viên – mã `HV02`, lưu tại `research/evidence-quotes.md`.

    3. > “[Điền nguyên văn câu trả lời về thời gian chờ nhận được thông tin.]”
       > **Nguồn:** Khảo sát học viên – mã `HV03`, lưu tại `research/evidence-quotes.md`.

    4. > “[Điền nguyên văn câu trả lời về thông tin khóa học, nhập học, nội quy hoặc cơ sở vật chất.]”
       > **Nguồn:** Khảo sát học viên – mã `HV04`, lưu tại `research/evidence-quotes.md`.

    5. > “[Điền nguyên văn câu trả lời về mong muốn có một nơi tra cứu thông tin nhanh và chính xác.]”
       > **Nguồn:** Khảo sát học viên – mã `HV05`, lưu tại `research/evidence-quotes.md`.


## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):
- Ứng viên ĐÃ LOẠI + vì sao:
- Ứng viên CHỌN + vì sao (bằng số):

## §3. Giải pháp tương tự đã nghiên cứu
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ 23:59, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥3 tên) + kế hoạch vòng validation CP5 (3 câu hỏi, ai log):
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```
