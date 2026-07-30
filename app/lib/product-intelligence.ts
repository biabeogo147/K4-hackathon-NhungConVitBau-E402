export type ConversationIntent =
  | "greeting"
  | "admissions"
  | "curriculum"
  | "preparation"
  | "benefits"
  | "schedule"
  | "exam"
  | "onboarding"
  | "general";

const FOLLOW_UPS: Record<ConversationIntent, string[]> = {
  greeting: [
    "Chương trình phù hợp với ai?",
    "Lộ trình học gồm những gì?",
    "Tôi nên chuẩn bị từ đâu?",
  ],
  admissions: [
    "Hồ sơ đăng ký gồm những gì?",
    "Quy trình tuyển chọn diễn ra thế nào?",
    "Sinh viên trái ngành cần chuẩn bị gì?",
  ],
  curriculum: [
    "Lộ trình học gồm những giai đoạn nào?",
    "Chương trình thiên về lý thuyết hay thực hành?",
    "Học viên sẽ làm những loại dự án nào?",
  ],
  preparation: [
    "Đánh giá mức độ sẵn sàng của tôi",
    "Gợi ý kế hoạch chuẩn bị 2 tuần",
    "Tôi nên ôn kỹ năng nào trước?",
  ],
  benefits: [
    "Học viên có những nghĩa vụ gì?",
    "Điều kiện để nhận hỗ trợ là gì?",
    "Chương trình kéo dài bao lâu?",
  ],
  schedule: [
    "Chương trình học toàn thời gian ra sao?",
    "Nếu bận một buổi thì xử lý thế nào?",
    "Thông tin lịch mới nhất cần xác minh ở đâu?",
  ],
  exam: [
    "Ngày thi cần mang theo gì?",
    "Những vật dụng nào không được mang vào?",
    "Nếu đến muộn thì xử lý thế nào?",
  ],
  onboarding: [
    "Sau khi trúng tuyển cần hoàn tất những bước nào?",
    "Khi nào được mời vào GitHub và Discord?",
    "Lỗi Authenticator cần hỗ trợ ở đâu?",
  ],
  general: [
    "Chương trình phù hợp với ai?",
    "Quyền lợi và cam kết của học viên là gì?",
    "Tôi nên bắt đầu tìm hiểu từ đâu?",
  ],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

export function getConversationGuidance(question: string, hasSources: boolean) {
  const query = normalize(question).trim();
  let intent: ConversationIntent = "general";

  if (
    query.length <= 40 &&
    /^(xin chao|chao|hello|hi|hey|alo|cam on|thanks)( ban| moi nguoi)?[!?.\s]*$/.test(
      query,
    )
  ) {
    intent = "greeting";
  } else if (
    /(onboarding|github|discord|authenticator|ticket|role learner|tai khoan|otp)/.test(
      query,
    )
  ) {
    intent = "onboarding";
  } else if (/(\bthi\b|vong 2|cccd|phong thi)/.test(query)) {
    intent = "exam";
  } else if (/(hoc phi|phu cap|quyen loi|tro cap)/.test(query)) {
    intent = "benefits";
  } else if (
    /(dang ky|tuyen sinh|trung tuyen|ung vien|phong van|ho so|dau vao|trai nganh)/.test(
      query,
    )
  ) {
    intent = "admissions";
  } else if (
    /(san sang|chuan bi|lo trinh ca nhan|ky nang|kien thuc nen|nen hoc gi|bat dau tu dau)/.test(
      query,
    )
  ) {
    intent = "preparation";
  } else if (
    /(chuong trinh hoc|noi dung hoc|mon hoc|hoc gi|lo trinh hoc|du an|thuc hanh|curriculum)/.test(
      query,
    )
  ) {
    intent = "curriculum";
  } else if (
    /(lich|khoa \d|khai giang|thoi gian|thang \d|dia diem|toan thoi gian|deadline|nguon cu|trang moi|\bhan\b)/.test(
      query,
    )
  ) {
    intent = "schedule";
  }

  const needsClarification =
    (intent === "preparation" &&
      !/(python|lap trinh|toan|du lieu|portfolio|toan thoi gian|trai nganh)/.test(
        query,
      )) ||
    (intent === "schedule" &&
      /(lich|khai giang|deadline|\bhan\b)/.test(query) &&
      !/(khoa\s*\d|nam\s*20\d{2}|hien tai|moi nhat)/.test(query));
  const asksForHuman =
    /(nguoi phu trach|tu van vien|lien he|hotline|email|gap ai|ta|ban to chuc)/.test(
      query,
    );
  const timeSensitive =
    intent === "schedule" ||
    /(moi nhat|hien tai|hom nay|\bhan\b|nam 20\d{2})/.test(query);

  return {
    intent,
    suggestions: FOLLOW_UPS[intent],
    needsClarification,
    needsHumanHelp: asksForHuman || !hasSources,
    timeSensitive,
  };
}
