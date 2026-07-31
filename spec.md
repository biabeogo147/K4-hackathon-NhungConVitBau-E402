# AI SPEC — Hỏi đáp thông tin khóa học có căn cứ · Nhóm Những con vịt bầu · Zone 3
Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [X] C — Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [X] Tính năng mới

> **Ghi chú dữ liệu:** Các số liệu dưới đây được tổng hợp từ sheet `Form Responses 1` trong file `Khảo sát Agent lab05.xlsx`, gồm 44 phản hồi. Biểu mẫu không thu tên, không hỏi trực tiếp tần suất phát sinh vấn đề và cũng không hỏi trực tiếp mức “sẵn sàng sử dụng”; các chỗ này được ghi rõ là chưa đo hoặc chỉ là chỉ báo gần đúng, không dùng thay cho số đo thật.

## §1. User & Job
  - Số liệu mining / kết quả khảo sát (`n = 44`):
    - `40/44` học viên (`90,9%`) chọn ít nhất một khó khăn khi tìm hiểu chương trình trước nhập học.
    - `21/44` học viên (`47,7%`) chấm mức hài lòng với cách truyền tải thông tin ở mức `1–2/5`; điểm trung bình là `2,93/5`.
    - `21/44` học viên (`47,7%`) cho biết cách hiện tại chỉ giải quyết được khoảng một nửa vấn đề hoặc ít hơn.
    - `29/44` học viên (`65,9%`) mất từ `1 giờ` trở lên để giải quyết một vấn đề.
    - `12/44` học viên (`27,3%`) nêu rõ kênh hỏi là email cho ban tổ chức/mentor; đây là số tối thiểu đo được từ lựa chọn kênh.
  - ≥5 quote/ví dụ nguyên văn + nguồn: xem phần Evidence bên dưới.

- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
  * **Job executor:** Học viên đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học.
  * **Workflow hiện tại:**

    1. Học viên phát sinh câu hỏi về khóa học, thời gian nhập học, tài liệu, lịch học, nội quy hoặc quy định.
    2. Học viên tự tìm kiếm thông tin trên website, tài liệu, email hoặc nhóm trao đổi.
    3. Nếu không tìm thấy hoặc các nguồn nói khác nhau, học viên liên hệ nhân viên tư vấn, mentor, giảng viên hoặc hỏi bạn cùng khóa.
    4. Người phụ trách kiểm tra thông tin và trả lời.
    5. Học viên tự đối chiếu câu trả lời với các nguồn khác; nếu vẫn chưa chắc thì tiếp tục hỏi lại.
    6. Các học viên khác tiếp tục hỏi những câu tương tự.

- Core JTBD (không tên sản phẩm/AI trong câu):
  > Khi đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học, học viên muốn nhanh chóng tìm được câu trả lời chính xác cho các câu hỏi cơ bản để có thể chuẩn bị đầy đủ và yên tâm tham gia học tập.

- Problem statement (KHÔNG chữ AI):
  > Học viên trước và mới tham gia khóa học gặp khó khăn khi tìm kiếm các thông tin cơ bản vì thông tin nằm rải rác ở nhiều nguồn, khó tìm hoặc chưa được trình bày rõ ràng. Điều này khiến học viên mất thời gian chờ đợi, dễ bỏ sót thông tin quan trọng và phải liên hệ người phụ trách nhiều lần. Đồng thời, nhân viên nhà trường phải lặp lại việc trả lời các câu hỏi tương tự, làm giảm thời gian dành cho những trường hợp cần hỗ trợ chuyên sâu.

- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  * **Số liệu mining / kết quả khảo sát (`n = 44`):**

    * Đối tượng khảo sát: Học viên đang tìm hiểu, chuẩn bị nhập học hoặc mới tham gia khóa học.
    * Cỡ mẫu: `n = 44`.
    * Số người xác nhận từng gặp khó khăn khi tìm thông tin cơ bản: `40/44`.
    * Tỷ lệ xác nhận: `90,9%`.
    * Số người từng hỏi trực tiếp ban tổ chức/mentor qua email: `12/44` (`27,3%`). Khảo sát không có lựa chọn riêng cho “giảng viên”, nên không cộng gộp thêm.
    * Số người mất từ 1 giờ trở lên để giải quyết một vấn đề: `29/44` (`65,9%`).
    * Số người tự giải quyết được khoảng một nửa hoặc ít hơn: `21/44` (`47,7%`).
    * Tỷ lệ sẵn sàng sử dụng công cụ hỏi đáp nhanh: **chưa được đo trực tiếp trong biểu mẫu**. Chỉ báo gần đúng: `35/44` phản hồi ở Câu 9 nêu một nhu cầu tương đối cụ thể, nhưng không được dùng như tỷ lệ sẵn sàng sử dụng.
    * Các tín hiệu vấn đề chính:
      - Không rõ lộ trình học/output: `27/44` (`61,4%`).
      - Không rõ chương trình dạy gì ở từng giai đoạn: `25/44` (`56,8%`).
      - Không tìm được thông tin chi tiết về chương trình: `22/44` (`50,0%`).
      - Thông tin từ các nguồn mâu thuẫn nhau: `15/44` (`34,1%`).
      - Chấm mức nghiêm trọng `4–5/5` cho overload thông tin: `27/44` (`61,4%`).
      - Chấm mức nghiêm trọng `4–5/5` cho thông tin rải rác nhiều kênh: `24/44` (`54,5%`).
      - Chấm mức nghiêm trọng `4–5/5` cho khó tìm tài liệu/bài giảng: `22/44` (`50,0%`).
      - Chấm mức nghiêm trọng `4–5/5` cho deadline/lịch học/thay đổi lịch: `20/44` (`45,5%`).
    * Kênh hiện tại được dùng nhiều: Discord `26/44`, hỏi bạn cùng khóa `21/44`, Zalo `13/44`, email ban tổ chức/mentor `12/44`, Facebook `10/44`, tự vật lộn không hỏi ai `6/44`.
    * Nguồn dữ liệu gốc: `Khảo sát Agent lab05.xlsx` → sheet `Form Responses 1`.
    * Nguồn dự kiến trong repo: `research/survey-results.csv`, `research/mining-results.md`.

  * **≥5 quote/ví dụ nguyên văn + nguồn:**

    1. > “Ngày đầu em không biết tài liệu buổi 1 nằm ở đâu, phải nhắn hỏi 3 người mới có link Drive”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV25`, sheet `Form Responses 1`, dòng 26; dự kiến lưu tại `research/evidence-quotes.md`.

    2. > “Có lúc Zalo nói deadline khác, Discord ghi khác, không biết tin cái nào”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV27`, sheet `Form Responses 1`, dòng 28; dự kiến lưu tại `research/evidence-quotes.md`.

    3. > “Em là dân non-tech, buổi đầu nghe toàn thuật ngữ lạ, không biết hỏi ai giải thích lại vì sợ hỏi ngu, tra Google cũng không ra đúng ngữ cảnh chương trình”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV30`, sheet `Form Responses 1`, dòng 31; dự kiến lưu tại `research/evidence-quotes.md`.

    4. > “Tài liệu nằm rải rác ở Drive, Discord, Notion, mỗi lần cần lại phải lục lại từ đầu vì không nhớ để ở đâu”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV32`, sheet `Form Responses 1`, dòng 33; dự kiến lưu tại `research/evidence-quotes.md`.

    5. > “Thông báo quan trọng bị trôi mất trong group chat đông người, đọc lại thì đã qua deadline”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV34`, sheet `Form Responses 1`, dòng 35; dự kiến lưu tại `research/evidence-quotes.md`.

    6. > “Tuần đầu em hỏi 4 người thì được 4 câu trả lời khác nhau về lộ trình, cuối cùng không biết tin ai, mất gần 1 ngày mới có câu trả lời chính thức”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV42`, sheet `Form Responses 1`, dòng 43; dự kiến lưu tại `research/evidence-quotes.md`.

    7. > “Sợ hỏi mentor vì thấy mentor bận, nên nhiều câu hỏi nhỏ em tự đoán rồi làm sai, đến lúc nộp bài mới biết sai hướng”
       >
       > **Nguồn:** Khảo sát học viên – mã `HV44`, sheet `Form Responses 1`, dòng 45; dự kiến lưu tại `research/evidence-quotes.md`.

## §2. Impact & quyết định chọn
- Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):

| Ứng viên | Bao nhiêu người có tín hiệu nhu cầu | Tần suất | Tốn gì mỗi lần | Khả thi trong prototype |
|---|---:|---|---|---|
| Hỏi đáp thông tin chính thức, có dẫn nguồn | `40/44` có ít nhất một khó khăn trước nhập học; `15/44` gặp nguồn mâu thuẫn | Khảo sát chưa hỏi trực tiếp; dự kiến phát sinh nhiều lần trong giai đoạn trước và 1–2 tuần đầu | `29/44` mất ≥1 giờ/vấn đề; `21/44` chỉ tự giải quyết được khoảng một nửa hoặc ít hơn | **Cao** nếu giới hạn corpus chính thức, có citation và cơ chế không trả lời khi thiếu nguồn |
| Tìm đúng link tài liệu/bài giảng | `22/44` chấm mức nghiêm trọng 4–5/5 | Thường theo từng buổi học; đây là suy luận từ nội dung quote, chưa phải số đo tần suất | Mất thời gian lục Drive/Discord/Notion, phải hỏi nhiều người | **Cao–trung bình**; có thể gộp vào ứng viên hỏi đáp bằng metadata buổi/chủ đề |
| Tổng hợp thông báo, ưu tiên việc cần làm và nhắc deadline | Overload `27/44`, thông tin rải rác `24/44`, deadline `20/44` chấm 4–5/5 | Có thể hàng ngày/tuần; khảo sát chưa đo trực tiếp | Có nguy cơ bỏ sót thông báo, trễ deadline, phải đọc lại nhiều kênh | **Trung bình**; cần đồng bộ đa kênh và dữ liệu thời gian thực, cost-of-error cao hơn |
| Trợ lý giải thích kiến thức/debug/lộ trình cá nhân | `17/44` chấm 4–5/5 cho không biết hỏi ai về chuyên môn; `8/44` nêu nhu cầu học/code ở Câu 9 | Theo buổi/bài tập; chưa đo trực tiếp | Làm sai hướng, mất điểm hoặc phụ thuộc vào câu trả lời sai | **Trung bình–thấp** trong lát cắt này; phạm vi kiến thức rộng, cần eval chuyên môn sâu |

- Ứng viên ĐÃ LOẠI + vì sao:
  - **Tự động tổng hợp và nhắc deadline đa kênh:** chưa chọn ở lát cắt đầu vì phải lấy dữ liệu thời gian thực từ nhiều kênh; một lịch cũ hoặc thông báo bị thiếu có thể làm học viên trễ hạn.
  - **Trợ lý làm bài/debug/giải thích toàn bộ kiến thức:** chưa chọn vì mở rộng phạm vi quá lớn và lỗi có thể khiến học viên học sai hoặc nộp bài sai hướng.
  - **Tự động thực hiện tác vụ hành chính:** loại khỏi phạm vi vì hệ thống không có thẩm quyền đổi lịch, xác nhận học phí, hoàn tiền, điểm danh hay gia hạn.

- Ứng viên CHỌN + vì sao (bằng số):
  - **Chọn:** Hỏi đáp thông tin khóa học có căn cứ, kèm nguồn và đường chuyển tiếp khi thiếu căn cứ.
  - **Vì sao:** `40/44` có khó khăn trước nhập học; `29/44` mất ít nhất 1 giờ cho một vấn đề; `21/44` chỉ tự giải quyết được khoảng một nửa hoặc ít hơn; `15/44` gặp thông tin mâu thuẫn. Đây cũng là ứng viên có thể giảm cost-of-error bằng cách chỉ trả lời từ nguồn chính thức, hiển thị nguồn và từ chối đoán.

## §3. Giải pháp tương tự đã nghiên cứu
- **NotebookLM:**
  - **Flow:** người dùng thêm/chọn nguồn → đặt câu hỏi → nhận câu trả lời dựa trên nguồn kèm citation để mở lại đoạn gốc.
  - **Đáng học:** giới hạn câu trả lời theo corpus đã chọn; citation đặt ngay trong câu trả lời; cho người dùng kiểm tra ngữ cảnh gốc.
  - **Đáng né:** không biến giao diện có citation thành cam kết “luôn đúng”; vẫn phải báo giới hạn và tạo đường đi khi nguồn thiếu hoặc mâu thuẫn.
  - **Mình khác gì:** corpus là tài liệu chính thức của một chương trình, có thứ tự ưu tiên nguồn, metadata khóa/cohort/buổi và handoff đến đúng bộ phận.

- **Intercom Fin:**
  - **Flow:** quản trị viên cấu hình knowledge sources/audience → người dùng hỏi → hệ thống trả lời từ knowledge → khi không giải quyết được thì handoff/escalate theo rule.
  - **Đáng học:** quản lý nguồn tập trung, giới hạn nội dung theo audience, preview trước khi go-live, quy tắc escalation rõ.
  - **Đáng né:** không tự động xử lý chính sách hoặc đóng case khi nguồn chưa được cập nhật; không dùng nội dung ngoài corpus chính thức làm căn cứ.
  - **Mình khác gì:** tối ưu cho onboarding học viên, tập trung câu hỏi lịch–tài liệu–quy định–lộ trình, không phải hệ thống chăm sóc khách hàng/ticket tổng quát.

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
  > Một học viên mới hỏi một câu về lịch, tài liệu hoặc quy định; hệ thống quyết định có đủ căn cứ chính thức để trả lời hay cần hỏi lại/chuyển người phụ trách; học viên nhận câu trả lời ngắn kèm nguồn hoặc bước tiếp theo rõ ràng.

- Non-goals (≥3 thứ KHÔNG build):
  1. Không làm bài tập, sinh đáp án, debug toàn bộ code hoặc chấm bài.
  2. Không tự thay đổi lịch học, deadline, điểm danh, học phí, hoàn tiền hoặc quyền lợi.
  3. Không tự động gửi thông báo hàng loạt hay đồng bộ toàn bộ Discord/Zalo/Facebook ở prototype đầu.
  4. Không trả lời kiến thức ngoài tài liệu chính thức của chương trình như một nguồn chuyên môn tổng quát.
  5. Không thu thập hoặc tiết lộ dữ liệu cá nhân của học viên khác.

- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [X] Working
  - **Phần thật:** hỏi đáp trên corpus nhỏ đã duyệt; retrieval; citation; phân loại `đủ căn cứ / cần hỏi lại / không có căn cứ / ngoài phạm vi`; phòng luyện tập tự đánh giá từ ngân hàng đã loại trùng; log feedback.
  - **Phần mock:** đăng nhập, hồ sơ cohort, ticket/handoff thực đến mentor/admin, đồng bộ đa kênh và cập nhật thời gian thực.

- Automation: [ ] augment [X] conditional [ ] automate
  - **Lý do theo cost-of-error:** hệ thống chỉ tự trả lời khi có nguồn phù hợp và đủ chắc; khi mơ hồ thì hỏi lại, khi thiếu hoặc mâu thuẫn thì không kết luận và chuyển người phụ trách. Không tự thực hiện hành động hành chính. Sai câu trả lời về deadline, học phí hoặc quy định có thể gây thiệt hại trực tiếp, nên không chọn automate hoàn toàn.

- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| **G1 — Make clear what the system can do** | Màn hình đầu ghi rõ chỉ trả lời lịch, tài liệu, lộ trình và quy định trong nguồn chính thức; hiển thị ví dụ câu hỏi hợp lệ và non-goals. |
| **G2 — Make clear how well the system can do what it can do** | Hiển thị trạng thái `Có căn cứ`, `Cần làm rõ`, hoặc `Không tìm thấy căn cứ`; không dùng phần trăm confidence giả nếu chưa hiệu chỉnh. |
| **G4 — Show contextually relevant information** | Chỉ hiển thị đoạn nguồn, ngày cập nhật, cohort/buổi học liên quan và link cần thiết thay vì đổ toàn bộ tài liệu. |
| **G9 — Support efficient correction** | Có nút “Thông tin chưa đúng” và ô cho user gửi nguồn/sửa cohort; giữ lại câu hỏi gốc để chạy lại sau khi sửa. |
| **G10 — Scope services when in doubt** | Hỏi lại cohort, ngày, môn, buổi hoặc loại chính sách trước khi trả lời; nếu vẫn không rõ thì chuyển tuyến. |
| **G11 — Make clear why the system did what it did** | Mỗi câu trả lời có “Dựa trên…” và mở được đoạn nguồn; nếu từ chối thì nêu lý do thiếu nguồn, nguồn mâu thuẫn hoặc ngoài thẩm quyền. |
| **PAIR — Errors + Graceful Failure** | Không tạo dead-end: khi không trả lời được, đưa link tài liệu liên quan, mẫu câu hỏi bổ sung hoặc kênh liên hệ phù hợp. |
| **PAIR — Feedback + Control** | User có thể chọn lại cohort/nguồn, đánh dấu hữu ích/không đúng và yêu cầu gặp người phụ trách; feedback được xác nhận nhưng không tự sửa knowledge chưa duyệt. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8)

| Tình huống cụ thể | Lớp | Hành vi mong muốn: nói gì, hiện gì, cho user làm gì tiếp | Nguyên tắc áp |
|---|---|---|---|
| User hỏi chính sách hoàn học phí nhưng corpus không có văn bản chính thức | ① Nguồn sự thật | Nói “Chưa tìm thấy căn cứ chính thức để kết luận”; không suy đoán; hiện kênh admin và mẫu thông tin cần gửi | G2, G10, PAIR Graceful Failure |
| Zalo ghi deadline thứ Sáu nhưng PDF kế hoạch ghi thứ Tư | ① Nguồn sự thật | Hiện rõ hai nguồn, thời điểm cập nhật và trạng thái “mâu thuẫn”; không chọn bừa; cho user gửi sang người phụ trách xác nhận | G11, G14, G10 |
| Nguồn đã hết hiệu lực nhưng vẫn đứng đầu retrieval | ① Nguồn sự thật | Ưu tiên tài liệu có version/ngày hiệu lực mới hơn; gắn nhãn “nguồn cũ”; nếu không xác định được nguồn mới thì không trả lời dứt khoát | G4, G11, G14 |
| User hỏi “Mai học ở đâu?” nhưng chưa có cohort, cơ sở và ngày cụ thể | ② Mơ hồ/thiếu thông tin | Hỏi lại tối đa các trường cần thiết: cohort nào, ngày nào, học online hay cơ sở nào; không đoán theo lịch gần nhất | G10 |
| User hỏi “Cho mình link bài 2” nhưng có nhiều module đều có Bài 2 | ② Mơ hồ/thiếu thông tin | Đưa 2–3 lựa chọn theo module/buổi để user chọn, sau đó mới trả link | G4, G10 |
| User gõ sai tên khóa hoặc dùng từ viết tắt nội bộ không rõ | ② Mơ hồ/thiếu thông tin | Nói cách hệ thống đang hiểu và yêu cầu xác nhận; cho phép sửa nhanh, không âm thầm chuẩn hóa | G2, G9, G10 |
| User yêu cầu đổi deadline, đánh dấu có mặt hoặc hoàn tiền ngay | ③ Ngoài phạm vi/thẩm quyền | Nêu rõ không có quyền thực hiện; không giả lập thành công; đưa đúng quy trình/link/form/người phụ trách | G1, G10, G16 |
| User hỏi số điện thoại, điểm số hoặc tình trạng học phí của học viên khác | ③ Ngoài phạm vi/thẩm quyền | Từ chối cung cấp dữ liệu cá nhân; giải thích ngắn; chuyển sang cách liên hệ hợp lệ | G1, PAIR Control |
| User yêu cầu “kết luận em chắc chắn được hoàn tiền chứ?” trong trường hợp ngoại lệ | ③ Ngoài phạm vi/thẩm quyền | Trích điều khoản chung nếu có nhưng không ra quyết định cá nhân; yêu cầu admin xác nhận bằng văn bản | G2, G10, G11 |
| User thuộc cohort B nhưng hệ thống lấy lịch cohort A vì câu hỏi không nói cohort | ④ Đặc thù domain | Không trả lời lịch khi thiếu cohort; dùng cohort từ profile chỉ như gợi ý và vẫn hiển thị để user xác nhận | G4, G10, G16 |
| Hệ thống trả nhầm deadline và học viên có nguy cơ nộp trễ | ④ Đặc thù domain | Chỉ đưa deadline khi nguồn chứa ngày rõ ràng; hiển thị ngày cập nhật và citation; nếu có nhiều nguồn thì chuyển sang trạng thái mâu thuẫn | G2, G11 |
| User gửi ảnh/link thông báo mới hơn để sửa câu trả lời | ④ Đặc thù domain / Correction | Ghi nhận correction, cho user xem câu trả lời cập nhật tạm thời có nhãn “chưa duyệt”; chuyển nguồn mới cho admin duyệt, không tự ghi đè corpus chính thức | G9, G15, G18 |
| User hiểu điểm luyện tập là điểm tuyển sinh chính thức | ④ Đặc thù domain | Hiện disclaimer trước và sau bài; không dùng điểm để dự đoán trúng tuyển; chỉ gợi ý nội dung nên ôn | G1, G2, G10 |

- **Kịch bản làm nhóm sợ nhất khi demo:** hệ thống tự chọn một deadline trong hai nguồn mâu thuẫn và trả lời rất tự tin, khiến học viên nộp trễ. Kịch bản này phải nằm trong golden set và là lỗi chặn release.

## §6. Bốn đường đi của trải nghiệm
- **Happy path:** học viên hỏi “Tài liệu buổi 2 cohort B ở đâu?” → hệ thống tìm được đúng tài liệu có metadata → trả link, mô tả ngắn, ngày cập nhật và citation → user mở nguồn hoặc đánh dấu hữu ích.
- **Low-confidence (②):** học viên hỏi “Mai học ở đâu?” → hệ thống không đoán → hỏi lại cohort/ngày/hình thức học → sau khi đủ thông tin mới retrieval và trả lời.
- **Failure/không căn cứ (①):** không có nguồn chính thức hoặc nguồn mâu thuẫn → hệ thống nói rõ chưa thể kết luận, hiển thị nguồn đã kiểm tra và nút chuyển admin/mentor.
- **Correction (user sửa):** user chọn “Thông tin chưa đúng”, sửa cohort hoặc gửi nguồn mới → hệ thống xác nhận đã nhận, chạy lại với input mới; nguồn mới chỉ vào corpus chính thức sau khi được duyệt.
- **Adaptive practice:** user làm 12 câu chẩn đoán → xem điểm theo bốn nhóm → luyện nhóm yếu hoặc ôn câu sai → chuyển tóm tắt sang chatbot để lập kế hoạch hai tuần.
- **Khi bị đòi ngoài phạm vi (③):** user yêu cầu đổi lịch/hoàn tiền/chấm điểm → hệ thống từ chối thực hiện, không tạo cảm giác đã thao tác, đưa quy trình và người có thẩm quyền.
- **Case đặc thù domain (④):** lịch và chính sách có version/cohort khác nhau → bắt buộc lọc theo cohort, ngày hiệu lực và thứ tự ưu tiên nguồn; không dùng câu trả lời chung khi trường hợp cá nhân chưa đủ điều kiện.

## §7. Kiểm thử
- Chiều chất lượng + định nghĩa kiểm chứng được:

| Chiều chất lượng | Định nghĩa kiểm chứng được |
|---|---|
| Groundedness | Mọi mệnh đề về lịch, tài liệu, học phí, quy định hoặc lộ trình phải được hỗ trợ bởi ít nhất một đoạn nguồn được truy hồi; không có nguồn thì không được kết luận. |
| Correctness | Câu trả lời khớp expected answer và đúng cohort/version/ngày hiệu lực trong golden set. |
| Citation correctness | Citation mở đúng tài liệu và đúng đoạn chứa thông tin hỗ trợ câu trả lời. |
| Clarification | Với case thiếu trường bắt buộc, hệ thống hỏi lại trước khi trả lời; không tự điền cohort/ngày/chính sách. |
| Uncertainty/failure routing | Case không có căn cứ hoặc nguồn mâu thuẫn phải đi vào đường “không kết luận + bước tiếp theo”, không sinh câu trả lời nghe hợp lý. |
| Scope/authority safety | 100% yêu cầu đổi lịch, hoàn tiền, điểm danh, chấm điểm hoặc dữ liệu người khác bị chặn đúng và chuyển tuyến. |
| Correction usability | User sửa input hoặc báo sai trong ≤2 thao tác và hệ thống giữ được ngữ cảnh câu hỏi. |
| Response usefulness | Câu trả lời có kết luận ngắn, link/nguồn, ngày cập nhật và bước tiếp theo; không chỉ trả một đoạn văn chung chung. |

- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong `eval/`):
  - File đề xuất: `eval/golden-set.jsonl`.
  - Cơ cấu `24` case:
    - `8` happy path có một nguồn chính thức rõ.
    - `4` case mơ hồ/thiếu cohort, ngày, buổi hoặc loại chính sách.
    - `4` case không có nguồn hoặc có hai nguồn mâu thuẫn.
    - `4` case ngoài phạm vi/thẩm quyền và riêng tư.
    - `4` case domain/correction: version cũ, cohort sai, deadline nguy hiểm, user gửi nguồn mới.
  - Mỗi case gồm: `id`, `question`, `user_context`, `allowed_sources`, `expected_answer`, `must_cite`, `expected_route`, `forbidden_claims`, `severity`.

- Quality bar (chốt từ 23:59, giữ nguyên sau đó):
  > **Đạt khi ≥ 85% case qua toàn bộ bộ test, và 100% case severity cao không có câu trả lời thiếu căn cứ/nhầm deadline/nhầm cohort; citation correctness ≥ 95%; 100% yêu cầu ngoài thẩm quyền bị chặn đúng.**

- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

| Lượt | Ngày | Tổng pass | Groundedness | Citation | Clarification | Safety/scope | Ghi chú |
|---|---|---:|---:|---:|---:|---:|---|
| Baseline | Chưa chạy | — | — | — | — | — | Chờ corpus và prompt đầu tiên |
| Iteration 1 | Chưa chạy | — | — | — | — | — | Cập nhật trước CP5 |
| Final trước CP6 | Chưa chạy | — | — | — | — | — | Không thay quality bar sau mốc chốt |

## §8. Phân công & kế hoạch
- Phân công có tên: **file khảo sát không chứa tên thành viên, cần nhóm điền trước CP tiếp theo**.
  - Spec: Lê Nguyễn Phước Thành - 2A202601032
  - Evidence: Trần Chí Hiển - 2A202601162
  - Prompt: Nguyễn Đàm Kiên - 2A202602015
  - Code : Nguyễn Văn Nam - 2A202601973
  - Demo: Lê Kim Tính - 2A202601560

- Willing users (≥3 tên) + kế hoạch vòng validation CP5:
  - Biểu mẫu không thu tên/contact, nên chưa thể ghi “tên” hoặc xác nhận willingness. Có thể ưu tiên mời lại các mã phản hồi giàu tín hiệu: `HV25`, `HV27`, `HV42`, `HV44`, sau khi xin được thông tin liên hệ và consent.
  - 3 câu hỏi validation:
    1. “Bạn có tìm được câu trả lời và nguồn trong dưới 2 phút không?”
    2. “Bạn có biết khi nào nên tin câu trả lời và khi nào cần hỏi người phụ trách không?”
    3. “Nếu câu trả lời sai/thiếu, bạn có sửa hoặc chuyển người phụ trách mà không bị mắc kẹt không?”

- Multi-prototype:
  - **Phương án A — Answer-first:** trả lời ngắn trước, citation và “xem nguồn” ngay dưới; nhanh cho happy path.
  - **Phương án B — Source-first:** hiện 2–3 nguồn/diễn giải để user chọn khi câu hỏi mơ hồ hoặc nguồn mâu thuẫn.
  - **Lý do chọn:** dùng A làm mặc định vì job là tìm câu trả lời nhanh; tự chuyển sang B ở low-confidence/conflict để giảm nguy cơ trả lời sai.

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 2026-07-30 | Điền số liệu `n=44`, tỷ lệ khó khăn, thời gian xử lý, mức tự giải quyết và các pain chính | Dựa trên toàn bộ sheet khảo sát |
| 2026-07-30 | Chốt lát cắt “hỏi đáp thông tin có căn cứ” thay vì agent 24/7 làm mọi việc | Impact cao hơn, phạm vi kiểm soát được; đối chiếu `HV25`, `HV27`, `HV42` |
| 2026-07-30 | Bổ sung ≥8 kịch bản theo 4 lớp ①–④ và quality bar severity cao | Theo yêu cầu guide §2.5; lỗi đáng sợ nhất là trả sai deadline |
| 2026-07-31 | Thêm chẩn đoán, luyện theo điểm yếu và xuất Anki | Biến readiness thành hành động tự học cụ thể nhưng không giả lập kết quả tuyển chọn |
