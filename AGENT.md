# AGENT.md — Tiêu chuẩn Dịch thuật Kỹ thuật Báo cáo FinePhrase sang Tiếng Việt

## Mục đích

Tài liệu này quy định **quy chuẩn dịch thuật và tiêu chuẩn làm việc** cho tất cả các sub-agents tham gia vào dự án dịch báo cáo kỹ thuật **"FinePhrase: The Synthetic Data Playbook: Generating Trillions of the Finest Tokens"** từ Hugging Face sang tiếng Việt (`finephrase-vi`). Mọi agent **PHẢI** đọc và tuân thủ các hướng dẫn này trước khi thực hiện bất kỳ thao tác chỉnh sửa nào.

---

## 1. Định hướng Tư duy & Phong cách Viết (Persona)

### Giọng văn (Tone & Voice)
* **Chuyên nghiệp, chính xác và có tính học thuật cao:** Diễn đạt như một kỹ sư dữ liệu lớn hoặc chuyên gia huấn luyện LLM chia sẻ các nghiên cứu khoa học thực nghiệm.
* **Dịch thoát ý (Free Translation):** Ưu tiên sự mạch lạc và tự nhiên trong văn phong tiếng Việt công nghệ, tránh dịch từng từ máy móc (literal translation).
* **Cấu trúc tiếp cận bài toán:** Khi giải thích các vấn đề phức tạp, luôn đi theo chuỗi logic: **Bối cảnh → Xung đột hệ thống → Giải thích toán học/logic → Minh họa bằng code/config**.

### Nguyên tắc bảo toàn
* **KHÔNG** dịch các đoạn code, cú pháp lập trình, tên tệp tin, hoặc cấu hình.
* **KHÔNG** làm mất hoặc dịch sai các công thức toán học LaTeX.
* **KHÔNG** tự ý thêm thông tin nằm ngoài phạm vi bài viết gốc.

---

## 2. Quy chuẩn Thuật ngữ Kỹ thuật (Glossary)

Để đảm bảo tính nhất quán trên toàn bộ tài liệu, các thuật ngữ sau đây cần được xử lý thống nhất:

### 2.1. LUÔN giữ nguyên tiếng Anh (Không dịch)
Các thuật ngữ công nghệ, tên thư viện hoặc tên mô hình:
```text
CommonCrawl, datatrove, nanotron, lighteval, MinHash, Llama, Mixtral, Phi3,
Snowflake-arctic-embed, GPT2, Web, HTML, URL, GPU, H100, CPU, API,
few-shot, zero-shot, multi-choice, free-form, F1 score, token, tokenizer,
embeddings, dataset, JSON, YAML, Python, bash, regex, blocklist, fastText,
WARC, WET, Chinchilla, Megatron-LM, DeepSpeed, sitemap, robots.txt, BibTeX
```

### 2.2. Dịch + Giữ gốc trong ngoặc (Đối với lần đầu xuất hiện)
Các thuật ngữ kỹ thuật cần được giải thích nghĩa tiếng Việt khi xuất hiện lần đầu trong mỗi chương:
```text
pretraining → tiền huấn luyện / huấn luyện tiền đề (pretraining)
deduplication → loại bỏ trùng lặp / loại trùng (deduplication)
data curation → thu thập và lọc dữ liệu (data curation)
ablation → thử nghiệm loại trừ / ablation study (ablation)
perplexity → độ hỗn loạn (perplexity)
downstream tasks → nhiệm vụ xuôi dòng / bài toán ứng dụng thực tế (downstream tasks)
base filtering → bộ lọc cơ bản (base filtering)
repetition filter → bộ lọc lặp (repetition filter)
document-level → cấp độ tài liệu (document-level)
line-level → cấp độ dòng (line-level)
Wasserstein distance → khoảng cách Wasserstein (Wasserstein distance)
synthetic data → dữ liệu tổng hợp / dữ liệu nhân tạo (synthetic data)
ground-truth → nhãn chuẩn / ground-truth (ground-truth)
fuzzy deduplication → loại trùng mờ (fuzzy deduplication)
exact deduplication → loại trùng khớp chính xác (exact deduplication)
intra-document deduplication → loại trùng lặp trong cùng tài liệu (intra-document deduplication)
cross-dump deduplication → loại trùng lặp chéo giữa các đợt crawl (cross-dump deduplication)
boilerplate → nội dung rác định dạng / boilerplate (boilerplate)
```

### 2.3. Dịch hoàn toàn sang tiếng Việt
Các từ vựng thông dụng và dễ hiểu trong ngữ cảnh học thuật:
```text
model → mô hình
methodology → phương pháp luận
accuracy → độ chính xác
performance → hiệu suất
metric → thước đo / chỉ số
reproduce → tái lập
reproducible → có thể tái lập
result → kết quả
table → bảng
chart / graph → biểu đồ
chapter → chương
technical report → báo cáo kỹ thuật
error / bug → lỗi
```

---

## 3. Định dạng và Cấu trúc MDX

### 3.1. Frontmatter YAML bắt buộc
Mỗi tệp Markdown trong Docusaurus phải bắt đầu bằng:
```yaml
---
sidebar_position: <thứ tự trong thư mục>
sidebar_label: '<tên ngắn gọn bằng tiếng Việt>'
---
```

### 3.2. Admonitions (Hộp thông tin)
Không sử dụng cú pháp Docusaurus cũ (`:::type`), bắt buộc sử dụng định dạng GFM Alerts chuẩn:
```markdown
> [!NOTE]
> 📝 **Ghi chú**
> Nội dung...

> [!TIP]
> 💡 **Mẹo**
> Nội dung...

> [!IMPORTANT]
> ⚠️ **Quan trọng**
> Nội dung...

> [!WARNING]
> ⚠️ **Cảnh báo**
> Nội dung...
```

### 3.3. MDX Safety (Thoát ký tự đặc biệt)
Tránh lỗi parse MDX đối với các ký tự `<` và `>` bên ngoài các khối code block:
* Sử dụng `&lt;` cho ký tự bé hơn (`<`).
* Sử dụng `&gt;` cho ký tự lớn hơn (`>`).
* Ví dụ: viết `mô hình có kích thước &lt;2B` thay vì `mô hình có kích thước <2B`.

### 3.4. Liên kết nội bộ (Links)
Đồng bộ hóa các liên kết nội bộ theo cấu trúc thư mục mới của Docusaurus tiếng Việt, sử dụng đường dẫn tuyệt đối bắt đầu bằng `/docs/` và bỏ phần mở rộng `.md` (Ví dụ: `/docs/web-data/du_lieu_cc`).

### 3.5. Cấu hình Slug cho Danh mục (Category Slugs)
Để tránh Docusaurus v4 tự động sinh slug bằng tiếng Việt có dấu/gạch nối bị lỗi liên kết, mọi file `_category_.json` phải định nghĩa rõ ràng `slug` tiếng Anh không dấu dạng `kebab-case`.
Ví dụ:
```json
{
  "label": "Dữ liệu Web & Nền tảng",
  "position": 1,
  "link": {
    "type": "generated-index",
    "slug": "/category/web-data"
  }
}
```

---

## 4. Phân chia Chương và Tên tệp tin (Naming Convention)

Dự án dịch sẽ được tổ chức theo cấu trúc thư mục Docusaurus như sau:

```text
docs/
├── gioi_thieu.md                                  # Giới thiệu tổng quan báo cáo kỹ thuật (Chapter 1)
├── thiet_lap.md                                   # Thiết lập thí nghiệm (Chapter 2)
├── thi_nghiem.md                                  # Chi tiết các thí nghiệm (Chapter 3)
├── phan_tich.md                                   # Phân tích kết quả thực nghiệm (Chapter 4)
├── ha_tang.md                                     # Hạ tầng & Pipeline sinh dữ liệu song song (Chapter 5)
├── finephrase.md                                  # Mô hình & Tập dữ liệu FinePhrase (Chapter 6)
├── ket_luan.md                                    # Kết luận & Đúc rút bài học (Chapter 7)
└── phu_luc.md                                     # Phụ lục, prompt templates & chi tiết huấn luyện (Chapter 8)
```

---

## 5. Quy trình Kiểm tra và Báo cáo (Checklist)

Từng agent dịch thuật và QA phải thực hiện kiểm duyệt trước khi đẩy mã nguồn:
- [ ] Tệp tin có đầy đủ phần YAML frontmatter và hiển thị chính xác trên thanh điều hướng.
- [ ] Không chứa ký tự `<` hoặc `>` trần ngoài code block (sử dụng `&lt;` và `&gt;`).
- [ ] Giữ nguyên 100% công thức toán học LaTeX và các khối mã nguồn gốc.
- [ ] Các thuật ngữ kỹ thuật tuân thủ Glossary trong phần 2.
- [ ] Mọi liên kết nội bộ hướng đến đúng URL dạng `/docs/path/to/page` (không dùng đuôi `.md` nếu dùng link tuyệt đối của trang).
- [ ] Đảm bảo tất cả danh mục đều có file `_category_.json` với trường `slug` tiếng Anh.
- [ ] Chạy `npm run build` thành công, đạt kết quả **0 warnings và 0 errors** liên quan đến broken links hay MDX parsing trước khi push lên main.
